export let words = new Map<number, string>(); 
export let valid_words : string[] = [];
export let tries = 0;

function dayOfYear(date: Date): number {
  return Math.floor(
    (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) -
      Date.UTC(date.getFullYear(), 0, 0)) /
      86400000
  );
}

export const loadWordsFile = async (): Promise<string> => {
  if (words.size > 0) return getTodayWord() || "";
  
  try {
    const response = await fetch('./words.txt');

    if (!response.ok) {
      throw new Error(`Failed to load words.txt (${response.status})`);
    }
    const text = await response.text();
    let split = text.split("\n");
    valid_words = split;
    
    for (let i = 0; i < 365; i++) {
      words.set(i, split[Math.floor(Math.random() * split.length)]);
    }
    return getTodayWord() || ""; 
  } catch (err) {
    console.error(err);
    return "";
  }
};

export function getTodayWord() {
  if (words.size === 0) return "";
  const today = new Date();
  const index = (today.getFullYear() * 366 + dayOfYear(today)) % words.size;
  return words.get(index);
}
    
export function getScore(guess: string, target: string): [string, string] {
    if (!target) return [guess, ""];

    const result: string[] = new Array(guess.length).fill("0");
    const remaining: Record<string, number> = {};

    for (let i = 0; i < guess.length; i++) {
        if (guess[i] === target[i]) {
        result[i] = "2";
        } else {
        const c = target[i];
        remaining[c] = (remaining[c] ?? 0) + 1;
        }
    }

    for (let i = 0; i < guess.length; i++) {
        if (result[i] === "2") continue;

        const char = guess[i];
        if (remaining[char] > 0) {
        result[i] = "1";
        remaining[char]--;
        }
    }

  return [guess, result.join("")];
}


export function UpdateUiWithScore(score: [string, string]): string[] {
  const rowColors = [...score[1]].map((value) => {
    if (value === "2") return "#538d4e";
    if (value === "1") return "#b59f3b"
    return "#3a3a3c";
  });

  tries += 1;
  if (score[1] === "22222") {
    alert(`Victory ! The word was ${getTodayWord()}`);
  } else if (tries === 6) {
    setTimeout(() =>  alert(`You failed! The word was ${getTodayWord()}`), 250);
  }

  return rowColors;
}