<script>
	let content = ""; // This will hold the text input from the textarea
</script>

<main>
	<h1>Enter Your Text Below</h1>
	<textarea bind:value={content} rows="10" cols="50" placeholder="Type here..."></textarea>
	<p>Text length: {content.length} characters</p>
</main>

<style>
    textarea {
        width: 100%;
	    	min-height: 200px;
  		  padding: 10px;
        box-sizing: border-box;
    		font-size: 16px;
    }

    main {
        max-width: 800px;
        margin: 20px auto;
        padding: 20px;
        box-shadow: 0 0 10px rgba(0,0,0,0.1);
    }

    h1 {
        color: #333;
    }
</style>
