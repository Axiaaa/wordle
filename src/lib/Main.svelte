<script lang="ts">
    import { onMount } from 'svelte';
    import { loadWordsFile, getScore, updateUiWithScore, valid_words, checkVictory, resetTries } from './wordService';
    import { Button, Modal, P } from "flowbite-svelte";
    import { slide } from "svelte/transition";
    import './../app.css';

    let word = "";
    let currentInput = "";
    let input = "";
    let score: [string, string] = ["", ""];
    let gridLetters = Array(30).fill("");
    let gridColors = Array(30).fill("");
    let currentRow = 0; 
    let modalContent = ["", ""];
    let inputRef: HTMLInputElement;
    let isModalOpen = false; 

    function toggleModal() {
        isModalOpen = !isModalOpen;
    }

    function triggerFocus() {
        if (inputRef) inputRef.focus();
    }

    onMount(async () => {
        word = await loadWordsFile(); 
        triggerFocus();
    });

    $: {
        modalContent = checkVictory(score);
        if (modalContent[0] != "") {
            setTimeout(() => toggleModal(), 350);
        }
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

    async function resetGame() {
        word = valid_words[Math.floor(Math.random() * valid_words.length) % valid_words.length];
        
        currentInput = "";
        input = "";
        
        gridLetters = Array(30).fill("");
        gridColors = Array(30).fill("");
        currentRow = 0;

        resetTries()
        
        score = ["", ""];
        isModalOpen = false;
        
        setInterval(() => triggerFocus(), 20);
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
            const newColors = updateUiWithScore(score);
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

<Modal 
    title={modalContent[0]}
    bind:open={isModalOpen}
    transition={slide} dismissable={false}
    style="color: white;
    font-style: normal ;
    font-size: 1.5rem;
    font-family: 'Clear Sans', 'Helvetica Neue', Arial, sans-serif;
    background-color: #3a3a3c"
    >
        <P style="font-size: 1rem">  { modalContent[1] + word.toUpperCase()}</P>
        {#snippet footer()}
            <Button style="color: #538d4e;" onclick={resetGame}>Play again with a random word!</Button>
            <Button style="color: #b59f3b;" onclick={toggleModal}>:( </Button>
        {/snippet}
</Modal>