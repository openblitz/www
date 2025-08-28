<script lang="ts">
  import { themeStore, type ThemePreference } from '$lib/stores';
  import { Button } from 'flowbite-svelte';
  import { MoonSolid, SunSolid, ComputerSpeakerSolid } from 'flowbite-svelte-icons';
  import { onMount } from 'svelte';

  // Accept server theme as prop to prevent icon flash
  export let serverTheme: ThemePreference | undefined = undefined;

  let mounted = false;

  // Use server theme initially, then client store after mount
  $: currentTheme = mounted ? $themeStore : (serverTheme || $themeStore);

  onMount(() => {
    mounted = true;
  });

  function cycleTheme() {
    themeStore.toggle();
  }

  function getThemeIcon(preference: ThemePreference) {
    switch (preference) {
      case 'light':
        return SunSolid;
      case 'dark':
        return MoonSolid;
      case 'system':
        return ComputerSpeakerSolid;
    }
  }

  function getThemeLabel(preference: ThemePreference) {
    switch (preference) {
      case 'light':
        return 'Light mode';
      case 'dark':
        return 'Dark mode';
      case 'system':
        return 'System preference';
    }
  }
</script>

<Button
  onclick={cycleTheme}
  class="override hover:bg-slate-50/85 dark:hover:bg-slate-800/85 hover:text-primary-900 dark:hover:text-primary-100 focus-within:ring-0 flex items-center justify-center"
  color="alternative"
  size="md"
  aria-label="Toggle theme (current: {getThemeLabel(currentTheme)})"
  title="Toggle theme (current: {getThemeLabel(currentTheme)})"
>
  <svelte:component this={getThemeIcon(currentTheme)} class="w-4 h-4" />
</Button>
