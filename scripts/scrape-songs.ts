import { writeFileSync, readFileSync } from "fs";
import { join } from "path";

const DATA_DIR = join(__dirname, "..", "src", "data");
const WIKI_API = "https://helloproject.fandom.com/api.php";
const LYRICS_API = "https://helloprolyrics.fandom.com/api.php";
const UA = "HelloProjectFanTool/1.0 (personal use)";

interface Song {
  id: string;
  titleJa: string;
  titleEn: string;
  groupId: string;
  releaseDate: string;
  type: "single" | "album-track" | "coupling";
}

interface LineDistribution {
  songId: string;
  lines: { memberId: string; seconds: number; percentage: number }[];
  totalSeconds: number;
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchApi(
  baseUrl: string,
  params: Record<string, string>
): Promise<Record<string, unknown> | null> {
  const url = new URL(baseUrl);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url.toString(), { headers: { "User-Agent": UA } });
  if (!res.ok) {
    console.error(`  HTTP ${res.status} for ${url.toString().slice(0, 100)}`);
    return null;
  }
  return res.json() as Promise<Record<string, unknown>>;
}

// Fetch all category members with pagination
async function fetchCategoryMembers(
  api: string,
  category: string
): Promise<{ title: string; pageid: number }[]> {
  const results: { title: string; pageid: number }[] = [];
  let cmcontinue: string | undefined;

  do {
    const params: Record<string, string> = {
      action: "query",
      list: "categorymembers",
      cmtitle: category,
      cmlimit: "50",
      format: "json",
    };
    if (cmcontinue) params.cmcontinue = cmcontinue;

    const data = await fetchApi(api, params);
    if (!data) break;

    const members = (
      data.query as { categorymembers: { title: string; pageid: number }[] }
    )?.categorymembers;
    if (members) results.push(...members);

    cmcontinue = (data.continue as { cmcontinue?: string })?.cmcontinue;
    if (cmcontinue) await sleep(300);
  } while (cmcontinue);

  return results;
}

// Fetch page wikitext
async function fetchWikitext(
  api: string,
  page: string
): Promise<string | null> {
  const data = await fetchApi(api, {
    action: "parse",
    page,
    prop: "wikitext",
    format: "json",
  });
  return (data?.parse as { wikitext?: { "*": string } })?.wikitext?.["*"] ?? null;
}

// Parse CD Infobox for release date and Japanese title
function parseInfobox(wikitext: string): {
  released?: string;
  jpName?: string;
} {
  const released =
    wikitext.match(/released\s*=\s*(\w+ \d+, \d{4})/i)?.[1] ||
    wikitext.match(/released\s*=\s*(\d{4}[.\-/]\d{1,2}[.\-/]\d{1,2})/)?.[1];
  const jpName =
    wikitext.match(/Japanese\s*=\s*(.+)/i)?.[1]?.trim() ||
    wikitext.match(/jpname\s*=\s*(.+)/i)?.[1]?.trim();
  return { released, jpName };
}

function normalizeDate(dateStr?: string): string {
  if (!dateStr) return "unknown";
  // "January 27, 1998" format
  const monthNames: Record<string, string> = {
    january: "01", february: "02", march: "03", april: "04",
    may: "05", june: "06", july: "07", august: "08",
    september: "09", october: "10", november: "11", december: "12",
  };
  const m1 = dateStr.match(/(\w+)\s+(\d+),?\s+(\d{4})/);
  if (m1) {
    const mon = monthNames[m1[1].toLowerCase()];
    if (mon) return `${m1[3]}-${mon}-${m1[2].padStart(2, "0")}`;
  }
  // "2004-01-21" or "2004/01/21"
  const m2 = dateStr.match(/(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})/);
  if (m2) return `${m2[1]}-${m2[2].padStart(2, "0")}-${m2[3].padStart(2, "0")}`;
  return "unknown";
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9\u3040-\u9fff]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

// Parse mcolor templates from lyrics wikitext
// Format: {{mcolor|Member Name|Abbreviated}} or just text colored by member
function parseMcolorDistribution(
  wikitext: string,
  memberLookup: Map<string, string>
): LineDistribution["lines"] | null {
  const counts = new Map<string, number>();

  // {{mcolor|MemberName|text}} pattern
  const mcolorRegex = /\{\{mcolor\|([^|]+)\|([^}]+)\}\}/g;
  let match;
  let found = false;

  while ((match = mcolorRegex.exec(wikitext)) !== null) {
    const name = match[1].trim();
    const text = match[2].trim();
    if (!text || text.length < 1) continue;

    // Try to resolve to a member ID
    const memberId = resolveMember(name, memberLookup) || slugify(name);
    counts.set(memberId, (counts.get(memberId) || 0) + text.length);
    found = true;
  }

  if (!found) return null;

  const total = Array.from(counts.values()).reduce((a, b) => a + b, 0);
  if (total === 0) return null;

  return Array.from(counts.entries())
    .map(([memberId, chars]) => ({
      memberId,
      seconds: chars,
      percentage: Math.round((chars / total) * 1000) / 10,
    }))
    .sort((a, b) => b.percentage - a.percentage);
}

function resolveMember(
  name: string,
  lookup: Map<string, string>
): string | undefined {
  const lower = name.toLowerCase().trim();
  return (
    lookup.get(lower) ||
    lookup.get(name.trim()) ||
    lookup.get(lower.replace(/\s+/g, "-"))
  );
}

function loadMemberLookup(): Map<string, string> {
  const data = JSON.parse(
    readFileSync(join(DATA_DIR, "members.json"), "utf-8")
  );
  const map = new Map<string, string>();
  for (const m of data) {
    map.set(m.nameEn.toLowerCase(), m.id);
    map.set(m.nameJa, m.id);
    // "Firstname Lastname" variations
    const parts = m.nameEn.split(" ");
    if (parts.length === 2) {
      map.set(`${parts[1]} ${parts[0]}`.toLowerCase(), m.id);
      // First name only (common in lyrics wiki)
      map.set(parts[0].toLowerCase(), m.id);
      map.set(parts[1].toLowerCase(), m.id);
    }
  }
  return map;
}

async function main() {
  const memberLookup = loadMemberLookup();
  console.log(`Loaded ${memberLookup.size} member name mappings\n`);

  const allSongs: Song[] = [];
  const allDistributions: LineDistribution[] = [];

  // Groups to scrape
  const groupCategories: [string, string][] = [
    ["Category:Morning_Musume_Singles", "morning-musume"],
    ["Category:Juice=Juice_Singles", "juice-juice"],
    ["Category:Tsubaki_Factory_Singles", "tsubaki-factory"],
    ["Category:BEYOOOOONDS_Singles", "beyooooonds"],
    ["Category:OCHA_NORMA_Singles", "ocha-norma"],
    ["Category:Country_Girls_Singles", "country-girls"],
    ["Category:Kobushi_Factory_Singles", "kobushi-factory"],
    ["Category:ANGERME_Singles", "angerme"],
    ["Category:C-ute_Singles", "cute"],
    ["Category:Berryz_Koubou_Singles", "berryz-koubou"],
  ];

  // Step 1: Get singles list from main wiki categories
  console.log("=== Fetching singles from main wiki ===");
  const singlePages: { title: string; groupId: string }[] = [];

  for (const [category, groupId] of groupCategories) {
    console.log(`\n${category}:`);
    const members = await fetchCategoryMembers(WIKI_API, category);
    // Filter out subcategories (ns=14) and non-article pages
    const articles = members.filter((m) => !m.title.startsWith("Category:"));
    console.log(`  ${articles.length} singles found`);
    for (const a of articles) {
      singlePages.push({ title: a.title, groupId });
    }
    await sleep(300);
  }

  console.log(`\nTotal: ${singlePages.length} singles to process`);

  // Step 2: Fetch metadata for each single from main wiki
  console.log("\n=== Fetching single metadata ===");
  for (const { title, groupId } of singlePages) {
    const wikitext = await fetchWikitext(WIKI_API, title);
    if (!wikitext) {
      // Still add with minimal info
      allSongs.push({
        id: `${groupId}-${slugify(title)}`,
        titleJa: title,
        titleEn: title,
        groupId,
        releaseDate: "unknown",
        type: "single",
      });
      continue;
    }

    const { released, jpName } = parseInfobox(wikitext);
    allSongs.push({
      id: `${groupId}-${slugify(title)}`,
      titleJa: jpName || title,
      titleEn: title,
      groupId,
      releaseDate: normalizeDate(released),
      type: "single",
    });

    await sleep(300);
  }

  console.log(`\nCollected ${allSongs.length} songs`);

  // Step 3: Fetch lyrics + distribution from lyrics wiki
  console.log("\n=== Fetching lyrics distribution ===");
  let distCount = 0;

  for (const song of allSongs) {
    // Try the English title on the lyrics wiki
    const wikitext = await fetchWikitext(LYRICS_API, song.titleEn);
    if (!wikitext) {
      await sleep(200);
      continue;
    }

    const lines = parseMcolorDistribution(wikitext, memberLookup);
    if (lines && lines.length > 1) {
      const total = lines.reduce((s, l) => s + l.seconds, 0);
      allDistributions.push({
        songId: song.id,
        lines,
        totalSeconds: total,
      });
      distCount++;
      console.log(
        `  ${song.titleEn}: ${lines.length} members - ${lines.map((l) => `${l.memberId}:${l.percentage}%`).join(", ")}`
      );
    }

    await sleep(200);
  }

  // Sort songs by date
  allSongs.sort((a, b) => a.releaseDate.localeCompare(b.releaseDate));

  writeFileSync(
    join(DATA_DIR, "songs.json"),
    JSON.stringify(allSongs, null, 2)
  );
  writeFileSync(
    join(DATA_DIR, "distributions.json"),
    JSON.stringify(allDistributions, null, 2)
  );

  console.log(
    `\nDone! ${allSongs.length} songs, ${distCount} distributions`
  );
}

main().catch(console.error);
