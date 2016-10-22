// Copyright 2016, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * This application demonstrates how to perform basic recognize operations with
 * with the Google Cloud Speech API.
 *
 * For more information, see the README.md under /speech and the documentation
 * at https://cloud.google.com/speech/docs.
 */

'use strict';

/*const document = require('jsdoc')

var trans = document.createElement('translate.js');
trans.src = 'translate.js';
document.head.appendChild(trans);*/

const fs = require('fs');
const record = require('node-record-lpcm16');
const speech = require('@google-cloud/speech')();

var l1 = 'en-US';
var l2 = 'es-ES';

var l1conf = 0;
var l2conf = 0;

var l1Active = false;
var l2Active = false;


// [START speech_sync_recognize]
function syncRecognize (filename, callback) {
	// Detect speech in the audio file, e.g. "./resources/audio.raw"
	speech.recognize(filename, {
		encoding: 'LINEAR16',
		sampleRate: 16000,
		languageCode: 'fr'
	}, (err, results) => {
		if (err) {
			callback(err);
			return;
		}

		console.log('Results:', results);
		translate(results, 'en');
		callback();
	});
}
// [END speech_sync_recognize]

// [START speech_streaming_recognize]
function streamingRecognize (filename, callback) {
	const options = {
		config: {
			encoding: 'LINEAR16',
			sampleRate: 16000
		}
	};

	// Create a recognize stream
	const recognizeStream = speech.createRecognizeStream(options)
	.on('error', callback)
	.on('data', (data) => {
		console.log('Data received: %j', data);
		callback();
	});

	// Stream an audio file from disk to the Speech API, e.g. "./resources/audio.raw"
	fs.createReadStream(filename).pipe(recognizeStream);
}
// [END speech_streaming_recognize]

function startRecord() {
	var stream1 = streamingMicRecognize(true);
	var stream2 = streamingMicRecognize(false);

	var mic = record.start({ sampleRate: 16000 });
	mic.pipe(stream1);
	mic.pipe(stream2);
}

function interrupt() {
	record.stop();
}

function setl1(str) {
	l1 = str;
}

function setl2(str) {
	l2 = str;
}

// [START speech_streaming_mic_recognize]
function streamingMicRecognize (isl1) {
	var lang = l2;
	var langOpp = l1
	if (isl1) {
		lang = l1;
		langOpp = l2;
	}

	const options = {
		config: {
			encoding: 'LINEAR16',
			sampleRate: 16000,
			languageCode: lang
		}
	};

	// Create a recognize stream
	const recognizeStream = speech.createRecognizeStream(options)
	.on('error', console.error)
	.on('data', (data) => {
		//process.stdout.write(data.results);
		if (isl1) {
			l1conf = confidence(data);
				if (!l1Active) {
					process.stdout.write('||1||');
					l1Active = true;
					l2Active = false;
				}
				translate(data.results, langOpp.substring(0,2));
			}
		}
		else {
			l2conf = confidence(data);
				if (!l2Active) {
					process.stdout.write('||2||');
					l2Active = true;
					l1Active = false;
				}
				translate(data.results, langOpp.substring(0,2));
			}
		}
	});
	
	// Start recording and send the microphone input to the Speech API
	//record.start({ sampleRate: 16000 }).pipe(recognizeStream);
}
// [END speech_streaming_mic_recognize]

function confidence(data) {
	if (data.results != null) {
		var n = results.length;
		for (var i = 0; i < n; i++) {
			if (data.results[i].stability != null) {
				n -= data.results[i].stability;
			}
		}
		return n;
	}
	return 10;
}


function translate(input, target) {
	const Translate = require('@google-cloud/translate');
	// Instantiates a client
	const translate = Translate({
		// The Translate API uses an API key for authentication. This sample looks
		// for the key in an environment variable.
	});

	// Translates the text into the target language. "input" can be a string for
	// translating a single piece of text, or an array of strings for translating
	// multiple texts.
	translate.translate(input, target, (err, translation) => {
		if (err) {
			console.error(err);
			return;
		}
		process.stdout.write(translation);
	});
}

// The command-line program
var cli = require('yargs');
var utils = require('../utils');

var program = module.exports = {
syncRecognize: syncRecognize,
streamingRecognize: streamingRecognize,
streamingMicRecognize: streamingMicRecognize,
interrupt: interrupt,
startRecord: startRecord,
translate: translate,
setl1: setl1,
setl2: setl2,
main: function (args) {
		// Run the command-line program
		cli.help().strict().parse(args).argv;
	}
};

cli
  .demand(1)
  .command('sync <filename>', 'Detects speech in an audio file.', {}, function (options) {
    program.syncRecognize(options.filename, utils.makeHandler(false));
  })
  .command('stream <filename>', 'Detects speech in an audio file by streaming it to the Speech API.', {}, function (options) {
    program.streamingRecognize(options.filename, utils.makeHandler(false));
  })
  .command('listen', 'Detects speech in a microphone input stream.', {}, function () {
    program.streamingMicRecognize();
  })
  .command('record', 'Detects speech in a microphone input stream. and processes', {}, function () {
    program.startRecord();
  })
  .command('translate <text> <targ>', 'Detects speech in an audio file by streaming it to the Speech API.', {}, function (options) {
    program.translate(options.text, options.targ);
  })
  .command('interrupt', 'Detects speech in a microphone input stream. and processes', {}, function () {
    program.interrupt();
  })
  .command('setl1 <lang>', 'changes language', {}, function (options) {
    program.setl1(options.lang);
  })
  .command('setl2 <lang>', 'Detects speech in a microphone input stream. and processes', {}, function (options) {
    program.setl2(options.lang);
  })
  .example('node $0 sync ./resources/audio.raw', 'Detects speech in "./resources/audio.raw".')
  .example('node $0 async ./resources/audio.raw', 'Creates a job to detect speech in "./resources/audio.raw", and waits for the job to complete.')
  .example('node $0 stream ./resources/audio.raw', 'Detects speech in "./resources/audio.raw" by streaming it to the Speech API.')
  .example('node $0 listen', 'Detects speech in a microphone input stream.')
  .wrap(120)
  .recommendCommands()
  .epilogue('For more information, see https://cloud.google.com/speech/docs');

if (module === require.main) {
  program.main(process.argv.slice(2));
}
