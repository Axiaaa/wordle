<script lang="ts">
    import { onMount } from 'svelte';
    import { loadWordsFile, getScore, UpdateUiWithScore, valid_words } from './wordService';

    let word = "";
    let currentInput = "";
    let input = "";
    let score: [string, string] = ["", ""];
    
    let gridLetters = Array(30).fill("");
    let gridColors = Array(30).fill("");
    let currentRow = 0; 
    
    let inputRef: HTMLInputElement;

    onMount(async () => {
        word = await loadWordsFile(); 
        triggerFocus();
    });

    function triggerFocus() {
        if (inputRef) inputRef.focus();
    }

    $: {
        const startIdx = currentRow * 5;
        if (currentRow < 6) {
            for (let i = 0; i < 5; i++) {
                gridLetters[startIdx + i] = currentInput[i] || "";
            }
            gridLetters = gridLetters;
        }
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            event.preventDefault();

            if (currentInput.length < 5) return;
            
            input = currentInput.toLowerCase();

            if (!valid_words.find((e) => e == input)) {
                alert("Invalid word!");
                triggerFocus();
                return;
            }
                
            score = getScore(input, word);
            const newColors = UpdateUiWithScore(score);
            const startIdx = currentRow * 5;

            for (let i = 0; i < 5; i++) {
                gridColors[startIdx + i] = newColors[i];
            }
            gridColors = gridColors;

            currentRow += 1; 
            currentInput = "";
            triggerFocus()
        }
    }
</script>

<svelte:window on:click={triggerFocus} />

<container id="wordlegrid">
    {#each gridLetters as letter, i}
        <item 
            id="c{i}" 
            class={letter ? 'active' : ''}
            style="background-color: {gridColors[i] || '#3a3a3c'}; transition: background-color 0.5s;"
        >
            {letter}
        </item>
    {/each}
</container>

<input 
    bind:this={inputRef}
    bind:value={currentInput} 
    maxlength="5" 
    on:keydown={handleKeydown}
    class="hidden-input"
    autocomplete="off"
/>