function translate(txt, targLang) {

	// Imports the Google Cloud client library
	const Translate = require('@google-cloud/translate');

	// Your Translate API key
	const apiKey = 'AIzaSyCP-TFmvNTa7JuoQCNt0q5f8WjzT_IVkIc';

	// Instantiates a client
	const translateClient = Translate({
	  key: apiKey
	});

	// The text to translate
	const text = txt;
	// The target language
	const target = targetLang;

	// Translates some text into Russian
	translateClient.translate(text, target, (err, translation) => {
	  if (err) {
		console.error(err);
		return;
	  }

	  //console.log(`Text: ${text}`);
	  process.stdout.write(translation);
	});
}