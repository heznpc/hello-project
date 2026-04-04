import { writeFileSync } from "fs";
import { join } from "path";

const DATA_DIR = join(__dirname, "..", "src", "data");
const UA = "HelloProjectFanTool/1.0 (personal use)";

// Main H!P groups with their MusicBrainz IDs
const GROUP_MBIDS: Record<string, string> = {
  "morning-musume": "9bffb20c-dd17-4895-9fd1-4e73e888d799",
  "angerme": "c0d4b203-3bfe-4007-9ad0-54d9f7a8c2a5",
  "juice-juice": "d-juice-juice", // placeholder, will look up
  "tsubaki-factory": "d-tsubaki-factory",
  "beyooooonds": "d-beyooooonds",
  "ocha-norma": "d-ocha-norma",
  "country-girls": "d-country-girls",
  "kobushi-factory": "d-kobushi-factory",
  "cute": "3d02f53a-5c39-4e2f-a498-4710cdcc9ee0",
  "berryz-koubou": "1f75c5e0-3ec4-4861-8e89-f8f3b631c218",
  "morning-musume-otome-gumi": "d-otome",
  "morning-musume-sakura-gumi": "d-sakura",
  "mini-moni": "d-minimoni",
  "taiyou-to-ciscomoon": "d-taiyou",
  "melon-kinenbi": "d-melon",
  "coconuts-musume": "d-coconuts",
  "country-musume": "d-country-musume",
  "v-u-den": "d-v-u-den",
  "w-double-you": "d-w",
  "hello-project": "670fda82-b7cf-47fd-b94d-9b4bab4bd9b7",
};

interface MBRelation {
  type: string;
  "type-id": string;
  target: string;
  direction: string;
  artist?: {
    id: string;
    name: string;
    "sort-name": string;
    type: string;
    disambiguation?: string;
  };
  attributes: string[];
  begin?: string;
  end?: string;
  ended?: boolean;
}

interface MBArtist {
  id: string;
  name: string;
  "sort-name": string;
  type: string;
  "life-span"?: {
    begin?: string;
    end?: string;
    ended?: boolean;
  };
  relations?: MBRelation[];
  disambiguation?: string;
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchMB(path: string): Promise<unknown> {
  const url = `https://musicbrainz.org/ws/2/${path}`;
  console.log(`  GET ${url}`);
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/json" },
  });
  if (!res.ok) {
    console.error(`  HTTP ${res.status} for ${url}`);
    return null;
  }
  await sleep(1100); // rate limit
  return res.json();
}

// Search for an artist by name, return MBID
async function searchArtist(name: string): Promise<string | null> {
  const data = (await fetchMB(
    `artist?query=${encodeURIComponent(name)}&fmt=json&limit=5`
  )) as { artists?: { id: string; name: string; disambiguation?: string }[] };
  if (!data?.artists?.length) return null;

  // Try to find H!P related
  const match = data.artists.find(
    (a) =>
      a.name.toLowerCase() === name.toLowerCase() ||
      a.disambiguation?.toLowerCase().includes("hello")
  );
  return match?.id || data.artists[0].id;
}

async function main() {
  const members = new Map<
    string,
    {
      id: string;
      nameJa: string;
      nameEn: string;
      color: string;
      birthDate: string;
      mbid: string;
    }
  >();
  const groups: {
    id: string;
    nameJa: string;
    nameEn: string;
    formed: string;
    dissolved?: string;
    color: string;
    mbid: string;
  }[] = [];
  const memberships: {
    memberId: string;
    groupId: string;
    joinDate: string;
    leaveDate?: string;
    role?: string;
    leaveReason?: string;
  }[] = [];

  // Group name mappings (EN slug -> Japanese name)
  const groupNames: Record<string, { ja: string; en: string }> = {
    "morning-musume": { ja: "モーニング娘。", en: "Morning Musume" },
    angerme: { ja: "アンジュルム", en: "ANGERME" },
    "juice-juice": { ja: "Juice=Juice", en: "Juice=Juice" },
    "tsubaki-factory": { ja: "つばきファクトリー", en: "Tsubaki Factory" },
    beyooooonds: { ja: "BEYOOOOONDS", en: "BEYOOOOONDS" },
    "ocha-norma": { ja: "OCHA NORMA", en: "OCHA NORMA" },
    "country-girls": { ja: "カントリー・ガールズ", en: "Country Girls" },
    "kobushi-factory": { ja: "こぶしファクトリー", en: "Kobushi Factory" },
    cute: { ja: "℃-ute", en: "C-ute" },
    "berryz-koubou": { ja: "Berryz工房", en: "Berryz Koubou" },
    "mini-moni": { ja: "ミニモニ。", en: "Minimoni" },
    "taiyou-to-ciscomoon": {
      ja: "太陽とシスコムーン",
      en: "Taiyou to Ciscomoon",
    },
    "melon-kinenbi": { ja: "メロン記念日", en: "Melon Kinenbi" },
    "coconuts-musume": { ja: "ココナッツ娘。", en: "Coconuts Musume" },
    "country-musume": { ja: "カントリー娘。", en: "Country Musume" },
    "v-u-den": { ja: "v-u-den", en: "v-u-den" },
    "w-double-you": { ja: "W", en: "W (Double You)" },
    "hello-project": {
      ja: "ハロー！プロジェクト",
      en: "Hello! Project",
    },
  };

  // Default colors for groups
  const groupColors: Record<string, string> = {
    "morning-musume": "#FFD700",
    angerme: "#FF6B9D",
    "juice-juice": "#9B59B6",
    "tsubaki-factory": "#E74C3C",
    beyooooonds: "#3498DB",
    "ocha-norma": "#2ECC71",
    "country-girls": "#F39C12",
    "kobushi-factory": "#1ABC9C",
    cute: "#E91E63",
    "berryz-koubou": "#FF9800",
    "mini-moni": "#FFEB3B",
    "taiyou-to-ciscomoon": "#FF5722",
    "melon-kinenbi": "#8BC34A",
    "coconuts-musume": "#795548",
    "country-musume": "#607D8B",
    "v-u-den": "#9C27B0",
    "w-double-you": "#00BCD4",
    "hello-project": "#FF1493",
  };

  // Resolve placeholder MBIDs by searching
  console.log("=== Resolving group MBIDs ===");
  for (const [slug, mbid] of Object.entries(GROUP_MBIDS)) {
    if (mbid.startsWith("d-")) {
      const name = groupNames[slug]?.en || slug;
      console.log(`Looking up MBID for: ${name}`);
      const resolved = await searchArtist(name);
      if (resolved) {
        GROUP_MBIDS[slug] = resolved;
        console.log(`  Found: ${resolved}`);
      } else {
        console.log(`  NOT FOUND, skipping`);
        delete GROUP_MBIDS[slug];
      }
    }
  }

  // Fetch each group's member relations
  console.log("\n=== Fetching group data ===");
  for (const [slug, mbid] of Object.entries(GROUP_MBIDS)) {
    if (slug === "hello-project") continue; // skip the umbrella

    console.log(`\nFetching: ${slug} (${mbid})`);
    const data = (await fetchMB(
      `artist/${mbid}?inc=artist-rels&fmt=json`
    )) as MBArtist | null;
    if (!data) continue;

    const gInfo = groupNames[slug] || { ja: data.name, en: data.name };
    groups.push({
      id: slug,
      nameJa: gInfo.ja,
      nameEn: gInfo.en,
      formed: data["life-span"]?.begin || "unknown",
      dissolved: data["life-span"]?.ended
        ? data["life-span"]?.end
        : undefined,
      color: groupColors[slug] || "#888888",
      mbid,
    });

    if (!data.relations) continue;

    const memberRels = data.relations.filter(
      (r) =>
        r.type === "member of band" &&
        r.direction === "backward" &&
        r.artist
    );

    for (const rel of memberRels) {
      const artist = rel.artist!;
      // Use sort-name for slug (it's typically romanized "Lastname, Firstname")
      const sortName = artist["sort-name"] || artist.name;
      const englishName = artist.name;
      // Try sort-name first (romanized), fall back to name, then MBID
      const slugSource = /[a-z]/i.test(sortName)
        ? sortName
        : /[a-z]/i.test(englishName)
          ? englishName
          : artist.id;
      const memberId = slugSource
        .toLowerCase()
        .replace(/,\s*/g, "-") // "Lastname, Firstname" -> "lastname-firstname"
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      // Determine nameEn: prefer the romanized form
      const nameEn = /[a-z]/i.test(englishName)
        ? englishName
        : /[a-z]/i.test(sortName)
          ? sortName.replace(/,\s*/, " ")
          : englishName;

      if (!members.has(artist.id)) {
        members.set(artist.id, {
          id: memberId,
          nameJa: /[\u3000-\u9fff\u30a0-\u30ff\u3040-\u309f]/.test(englishName)
            ? englishName
            : artist["sort-name"] || artist.name,
          nameEn,
          color: "#888888",
          birthDate: "",
          mbid: artist.id,
        });
      }

      memberships.push({
        memberId: members.get(artist.id)!.id,
        groupId: slug,
        joinDate: rel.begin || data["life-span"]?.begin || "unknown",
        leaveDate: rel.end || undefined,
        leaveReason: rel.ended ? "graduation" : undefined,
      });
    }

    console.log(`  ${memberRels.length} members found`);
  }

  // Fetch birth dates for members
  console.log("\n=== Fetching member birth dates ===");
  let count = 0;
  for (const [mbid, member] of members) {
    count++;
    if (count % 10 === 0) {
      console.log(`  ${count}/${members.size}...`);
    }
    const data = (await fetchMB(
      `artist/${mbid}?fmt=json`
    )) as MBArtist | null;
    if (data?.["life-span"]?.begin) {
      member.birthDate = data["life-span"].begin;
    }
    // Use sort-name for Japanese name if available
    if (data?.["sort-name"] && /[\u3000-\u9fff]/.test(data["sort-name"])) {
      member.nameJa = data["sort-name"];
    } else if (data?.name && /[\u3000-\u9fff]/.test(data.name)) {
      member.nameJa = data.name;
    }
  }

  // Write output
  const membersArr = Array.from(members.values()).sort((a, b) =>
    a.nameEn.localeCompare(b.nameEn)
  );

  const groupsArr = groups.sort(
    (a, b) => (a.formed || "").localeCompare(b.formed || "")
  );

  writeFileSync(
    join(DATA_DIR, "members.json"),
    JSON.stringify(membersArr, null, 2)
  );
  writeFileSync(
    join(DATA_DIR, "groups.json"),
    JSON.stringify(groupsArr, null, 2)
  );
  writeFileSync(
    join(DATA_DIR, "memberships.json"),
    JSON.stringify(memberships, null, 2)
  );

  console.log(
    `\nDone! ${membersArr.length} members, ${groupsArr.length} groups, ${memberships.length} memberships`
  );
}

main().catch(console.error);
