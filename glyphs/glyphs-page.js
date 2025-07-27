
// Get references to the buttons, text input, and dropdown
const button0 = document.getElementById("button0");
const button1 = document.getElementById("button1");
const button2 = document.getElementById("button2");
const button3 = document.getElementById("button3");
const button4 = document.getElementById("button4");
const button5 = document.getElementById("button5");
const button6 = document.getElementById("button6");
const button7 = document.getElementById("button7");
const button8 = document.getElementById("button8");
const button9 = document.getElementById("button9");
const buttonA = document.getElementById("buttonA");
const buttonB = document.getElementById("buttonB");
const buttonC = document.getElementById("buttonC");
const buttonD = document.getElementById("buttonD");
const buttonE = document.getElementById("buttonE");
const buttonF = document.getElementById("buttonF");
const textInput = document.getElementById("textInput");
const clearButton = document.getElementById("clearButton");
const clearLastCharButton = document.getElementById("clearLastCharButton");
const errorContainer = document.getElementById("error");

const copyLinkButton = document.getElementById("copy-link-button");
const copyConfirmation = document.getElementById("copy-confirmation");

copyLinkButton.addEventListener("click", () => {
    const glyphCode = textInput.value.trim().toUpperCase();
    const url = `${window.location.origin}${window.location.pathname}?address=${glyphCode}`;

    navigator.clipboard.writeText(url)
        .then(() => {
            copyConfirmation.style.display = "block";
            setTimeout(() => {
                copyConfirmation.style.display = "none";
            }, 2000);
        })
        .catch(err => console.error("Failed to copy:", err));
});

// Function to handle adding characters to the text input
function addToTextInput(value) {
    const currentValue = textInput.value;
    if (currentValue.length + value.length <= 12) {
        textInput.value = currentValue + value;
        clearError(); // Clear error message when characters are added
    } else {
        // Display an error message
        displayError("Maximum character limit reached (12 characters).");
    }
}

// Function to validate the input
function validateInput() {
    const inputValue = textInput.value;
    const isValid = /^[0-9a-fA-F]*$/.test(inputValue);

    if (!isValid) {
        displayError("Only numbers 0-9 and letters A-F are allowed.");
        // Remove invalid characters from the input
        textInput.value = inputValue.replace(/[^0-9a-fA-F]/g, "");
    } else {
        clearError();
    }
}

// Function to perform an action when the input field reaches 12 characters
function handleTextInputLength() {

    const inputLength = textInput.value.length;

    if (inputLength <= 11) {
        // Do something when the input has 11 or fewer characters
        document.getElementById("id-addr").innerHTML = "";
        document.getElementById("id-glyph").innerHTML = "";

        copyLinkButton.style.display = "none";
        copyConfirmation.style.display = "none";
    }

    else if (inputLength === 12) {
        // Do something when the input reaches 12 characters
        addr = glyphToAddr(textInput.value)
        document.getElementById("id-addr").innerHTML = addr;
        document.getElementById("id-glyph").innerHTML = textInput.value;

        copyLinkButton.style.display = "inline-block";
    }
}

// Add an input event listener to validate the input as you type
textInput.addEventListener("input", validateInput);

// Add an input event listener to the text input field
textInput.addEventListener("input", handleTextInputLength);

// Add a paste event listener to validate pasted content
textInput.addEventListener("paste", function (e) {
    setTimeout(validateInput, 0); // Delay validation after the paste operation
});

// Function to display an error message
function displayError(message) {
    errorContainer.textContent = message;
    textInput.style.borderColor = "red"; // Change border color to red
    textInput.style.backgroundColor = "#FFD3D3"; // Change background color to red

    // Automatically clear the error message after 5 seconds
    setTimeout(clearError, 5000); // 5000 milliseconds (5 seconds)
}

// Function to clear the error message and reset the border and background color
function clearError() {
    errorContainer.textContent = "";
    textInput.style.borderColor = "#ccc"; // Reset border color
    textInput.style.backgroundColor = "#fff"; // Reset background color
}

// Add click event listeners to the buttons
button0.addEventListener("click", function() {
    addToTextInput("0");
    handleTextInputLength();
});

button1.addEventListener("click", function() {
    addToTextInput("1");
    handleTextInputLength();
});

button2.addEventListener("click", function() {
    addToTextInput("2");
    handleTextInputLength();
});

button3.addEventListener("click", function() {
    addToTextInput("3");
    handleTextInputLength();
});

button4.addEventListener("click", function() {
    addToTextInput("4");
    handleTextInputLength();
});

button5.addEventListener("click", function() {
    addToTextInput("5");
    handleTextInputLength();
});

button6.addEventListener("click", function() {
    addToTextInput("6");
    handleTextInputLength();
});

button7.addEventListener("click", function() {
    addToTextInput("7");
    handleTextInputLength();
});

button8.addEventListener("click", function() {
    addToTextInput("8");
    handleTextInputLength();
});

button9.addEventListener("click", function() {
    addToTextInput("9");
    handleTextInputLength();
});

buttonA.addEventListener("click", function() {
    addToTextInput("A");
    handleTextInputLength();
});

buttonB.addEventListener("click", function() {
    addToTextInput("B");
    handleTextInputLength();
});

buttonC.addEventListener("click", function() {
    addToTextInput("C");
    handleTextInputLength();
});

buttonD.addEventListener("click", function() {
    addToTextInput("D");
    handleTextInputLength();
});

buttonE.addEventListener("click", function() {
    addToTextInput("E");
    handleTextInputLength();
});

buttonF.addEventListener("click", function() {
    addToTextInput("F");
    handleTextInputLength();
});

// Add click event listener to the Clear button
clearButton.addEventListener("click", function() {
    textInput.value = ""; // Clear the text input field
    clearError(); // Clear error message when the text is cleared
    handleTextInputLength();
});

// Add click event listener to the Clear Last Character button
clearLastCharButton.addEventListener("click", function() {
    const currentValue = textInput.value;
    textInput.value = currentValue.slice(0, -1); // Remove the last character
    clearError(); // Clear error message when a character is removed
    handleTextInputLength();
});

function glyphToAddr(glyph) {

    let xyz = {}
    xyz.p = parseInt(glyph.slice(0, 1), 16)
    xyz.s = parseInt(glyph.slice(1, 4), 16)
    xyz.y = (parseInt(glyph.slice(4, 6), 16) - 0x81) & 0xff
    xyz.z = (parseInt(glyph.slice(6, 9), 16) - 0x801) & 0xfff
    xyz.x = (parseInt(glyph.slice(9, 12), 16) - 0x801) & 0xfff

    return xyzToAddress(xyz)
}

function xyzToAddress(xyz) {
    let x = "000" + xyz.x.toString(16).toUpperCase()
    let z = "000" + xyz.z.toString(16).toUpperCase()
    let y = "000" + xyz.y.toString(16).toUpperCase()
    let s = "000" + xyz.s.toString(16).toUpperCase()

    x = x.slice(x.length - 4)
    z = z.slice(z.length - 4)
    y = y.slice(y.length - 4)
    s = s.slice(s.length - 4)

    let addr = x + ":" + y + ":" + z + ":" + s
    return addr
}

// Check URL parameters on load
window.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const glyphParam = params.get("address");

    if (glyphParam && /^[0-9a-fA-F]{1,12}$/.test(glyphParam)) {
        textInput.value = glyphParam.toUpperCase();
        handleTextInputLength();  // Trigger display update
    }
});