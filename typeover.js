var add_css = function() {
	const style = document.createElement('style');
	style.textContent = `
	@import url(//fonts.googleapis.com/css?family=Yanone+Kaffeesatz);
	@import url(//fonts.googleapis.com/css?family=Droid+Serif:400,700,400italic);
	@import url(//fonts.googleapis.com/css?family=Ubuntu+Mono:400,700,400italic);
	.overtype {
	  font-family: 'Ubuntu Mono';
	  font-weight: normal;
	  font-size: 1.3em;
	  margin-left: 25%;
	  margin-right: 25%;
	  margin-top: 2em;
	}
	.overtype pre {
	  font-family: 'Ubuntu Mono'; /* Firefox */
	}
	.rate {
	  font-family: 'Ubuntu Mono';
	  font-weight: normal;
	  font-size: 2em;
	  color: gray;
	}
/*	body {
	  background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCI+CjxmaWx0ZXIgaWQ9Im4iIHg9IjAiIHk9IjAiPgo8ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iMC42IiBudW1PY3RhdmVzPSIxMCIgc3RpdGNoVGlsZXM9InN0aXRjaCI+PC9mZVR1cmJ1bGVuY2U+CjwvZmlsdGVyPgo8cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI0ZGRkZERCI+PC9yZWN0Pgo8cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsdGVyPSJ1cmwoI24pIiBvcGFjaXR5PSIwLjUiPjwvcmVjdD4KPC9zdmc+"); 
	} */
	.hide {
	  display: none;
	}
	#content:focus {
	  outline: none;
	}
	span:focus {
	  outline: none;
	}
	.gray {
	  color: #AAAAAA;
	}
	.wrong {
	  color: #d8000c;
	  text-shadow: #ffbaba 1px 0 5px, #ffbaba -1px 0 5px, #ffbaba 0 1px 5px, #ffbaba 0 -1px 5px;
	  border-radius: 5%;
	  box-shadow: inset 0 0 2em #ff9a9a;
	}

	.cursor {
	  position: relative;
	}
	.cursor::before {
	  content: "|";
	  animation: blinker 1s linear infinite;
	  position: absolute;
	  color: black;
	  left: -0.2em;
	}
	@keyframes blinker {  
	  50% { opacity: 0; }
	}
.splash {
  position: absolute;
  right: 0.4em;
}
	.fa {
		text-decoration: none;
		}
  .fa-twitter-square {
	  color: black;
  }
	iframe {
	  overflow: hidden;
	}
  `;
	document.head.append(style);
}


var spanify_current = function (state) {
	var a = state.current
	var html = "<pre>"
	for (var i=0; i < a.length; i++) {
		html += '<span class="'
		if (state.typed[i] === state.untyped) {
		    html += "gray" // untyped
		} else if (state.typed[i] === a[i]) {
			html += "" // correct
		} else {
			html += "wrong"
		}
		if (i === state.offset) {
			html += " cursor"
		}
		html += '" tabindex="0">'
	    if (a[i] === "\n") {
			html += '<span class="fa fa-reply" style="font-size: 0.75em"></span>'
		} else {
			html += a[i]
		}
		html += '</span>'
		if (a[i] === "\n") {
		    html += '<br />'
		}
	}
	if (state.offset === a.length) {
		html += '<span class="cursor" tabindex="0"></span></pre>'
	} else {
		html += '<span></span></pre>'
	}
	return html
}

function backup(state) {
	if (state.offset > 0) {
		state.offset--
		state.typed[state.offset] = state.untyped
		// if (state.first_wrong === state.MAX_SAFE_INTEGER) {
		// 	state.correct_timings.pop()
		// }
		if (state.offset === state.first_wrong) {
			state.first_wrong = state.MAX_SAFE_INTEGER
		}
	}
	// else at begining of text, do nothing
}

function correct(state, key, timestamp) {
	state.typed[state.offset] = key
	state.offset++
	// state.correct_timings.push(timestamp)
	// update_timing_display(state)
}

function incorrect(state, key) {
	// if this is the first wrong character
	if (state.first_wrong === state.MAX_SAFE_INTEGER) {
		state.first_wrong = state.offset
	}
	// Only allow them to type up to 3 incorrect characters
	if (state.offset - state.first_wrong < 3) {
		state.typed[state.offset] = key
		state.offset++
	}
}

function normal_character(state, e) {
	if (state.first_wrong === state.MAX_SAFE_INTEGER &&
	    e.key === state.current[state.offset]) { // correct state and key
		correct(state, e.key, e.timeStamp)
	} else {
		incorrect(state, e.key)
	}
}

function enter_character(state, e) {
	console.log("enter_character")
	if (state.first_wrong === state.MAX_SAFE_INTEGER &&
		"\n" === state.current[state.offset]) {
		correct(state, "\n", e.timeStamp)
	} else {
		incorrect(state, "\n")
	}
}

function create_timing_display(state) {
	state.timing_display_element = document.getElementById("timing")
}

// function update_timing_display(state) {
// 	var sum = 0
// 	var t = state.correct_timings
// 	for (var i=0; i < t.length-1; i++) { sum += t[i+1] - t[i] }
// 	var average_time_per_char = sum / t.length
// 	var cps = 1000 / average_time_per_char
// 	var wpm = cps * 60 / 5
// 	var total_time = t[t.length-1] - t[0]
// 	state.timing_display_element.innerHTML = "wpm: " + wpm.toFixed(0)
// 	//state.timing_display_element.innerHTML = total_time.toFixed(0) + " cps: " + cps.toFixed(2) + "wpm: " + wpm.toFixed(0)
// }

// Disable backspace as a page navigation event when typing
$('#content').on("keydown", function (event) {
  if (event.keyCode === 8 || event.which === 8) { 
   event.preventDefault(); 
  } 
});

var eventize_content = function (state) {
	// Use keyup to effectively disable key-repeat
	$(state.content).keyup(function(e) {
		e.preventDefault();
	    if (e.key === "Backspace") {
		    backup(state)
	    } else if (e.key.length === 1 && state.offset < state.current.length) {
			normal_character(state, e)
        } else if (e.key === "Enter" && state.offset < state.current.length) {
			enter_character(state, e)
	    }
	    state.spanned = spanify_current(state)
	    state.content.innerHTML = state.spanned
	    $(".cursor").focus()
    })
}

var practice = function (string, visable_character_count, state) {
//	state.correct_timings = []
	state.current = string.substr(state.offset, visable_character_count).trim()
	state.untyped = ""
	// One array entry for every character position
	// Don't use Array.apply because that causes stack overflows
	state.typed = new Array(state.current.length)
	for (var i = 0; i < state.typed.length; i++) {
		state.typed[i] = state.untyped;
	}
	state.spanned = spanify_current(state)
	state.content.innerHTML = state.spanned
	console.log(state.offset)
	$(".cursor").focus()
}

var get_file_chunk = function (url, range, callback) {
  var xhr = new XMLHttpRequest;

  xhr.onreadystatechange = function () {
	if (xhr.readyState === 3) {
	  // This is where we can short-circut the process later
	  // by checking that we have all the data we need to start
	  // in the case that xhr.status is 200 (we are getting the whole file)
	  // rather than 206 (we are getting the range we requested)
	  //console.log(xhr.responseText.substring(range[0]-2, range[1]-2))
    }
	if (xhr.readyState === 4) {
		callback(xhr)
	}
	// else nothing
  }

  xhr.open('GET', url, true);
  xhr.setRequestHeader('Range', 'bytes='+range[0]+'-'+range[1]);
  xhr.send(null);
}

var state = {}
state.offset = 0 // Current offset in text
state.MAX_SAFE_INTEGER = 9007199254740991
state.first_wrong = state.MAX_SAFE_INTEGER

function init_via_text(element, text) {
	add_css()
	state.content = element
	eventize_content(state)
//	create_timing_display(state)
    practice(text, text.length, state)
}

function init_dickens(element) {
	state.content = element;
	var chunk_param = [1876, 1876+613]
	//var chunk_param = [1876+10, 1876+34]
	get_file_chunk("aTaleofTwoCities.txt", chunk_param, go_practice)	
}

function go_practice( xhr ) {
	var text = ""
	if (xhr.status === 206) {
		// We got the range we requested
		text = xhr.responseText
	} else if (xhr.status === 200) {
		// We got the whole file
		// Completely unclear why the offset is 2. Leading characters?
		text = xhr.responseText.substring(chunk_param[0]-2, chunk_param[1]-2)
	}
    eventize_content(state)
//	create_timing_display(state)
    practice(text, text.length, state)
}

