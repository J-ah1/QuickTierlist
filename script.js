/*
Global Variables
*/
var theCreateItemModal = document.getElementById("create-item-modal");
var theRowOptionsModal = document.getElementById("row-options-modal");
var fileUploadInput = document.getElementById("file-uploader");
var createItemFromTextfield = document.getElementById("create-item-from-text-field");
var keepItemModalOpenCB = document.getElementById("keep-items-modal-open-cb");
var unlistedListItems = document.getElementById("unlisted-list-items");
var openTrashIcon = document.getElementById("open-trash-icon");
var closedTrashIcon = document.getElementById("closed-trash-icon");
var nextItemId = 1; // NTS: Does NOT correlate to num of items
var listItemHeight = parseInt(getComputedStyle(document.body).getPropertyValue("--list-item-height"));

/*
Tier List Functions
*/
function autoGrow(element) {
    element.style.height = "5px";
    element.style.height = (element.scrollHeight) + "px";
    // Future note: should update every (var(--list-item-height)) instead
    // Future note2: name/change this according to the autoGrowRow functions
}
function autoResizeRow(){

}

/*
Modal: Base Functions
*/

function closeModal(){
    theCreateItemModal.style.display = "none";
    theRowOptionsModal.style.display = "none";
    selectedRowEl = null;
}
/*
Modal: Create List Item Functions
*/
function openCreateItemModal(){
    theCreateItemModal.style.display = "block";
}
function uploadImage(){
    for (const file of fileUploadInput.files){
        readImageFile(file);
    }
}
function readImageFile(file){
    if (!file.type.includes('image')) {
        return alert('Only images are allowed!');
    }
    if (file.size > 10_000_000) {
        return alert('Maximum upload size is 10MB!');
    }

    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.onload = (fileReaderEvent) => {
        createListItem(fileReaderEvent.target.result);
    }
}
// Pass create item text to createImageFromText()
function submitListItemText(){
    const seperateTexts  = createItemFromTextfield.value.split(",");
    for(let text of seperateTexts){
        createImageFromText(text.trim());
    }
}
// Create a list-item image from text
function createImageFromText(text){
    const tempCanvas = document.createElement("canvas");
    const tempContext = tempCanvas.getContext("2d");
    tempCanvas.width = listItemHeight;
    tempCanvas.height = listItemHeight;
    tempContext.fillStyle = "white";
    tempContext.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    const canvasText = text;
    tempContext.fillStyle = "black";
    const fontHeight = 24;
    tempContext.font = fontHeight.toString() + "px monospace";
    tempContext.textAlign = "center";
    tempContext.textBaseline = "middle";

    const words = canvasText.split(" ");
    let lines = [];
    let currentLine = words[0];
    for (let i = 1; i < words.length; i++) {
        let word = words[i];
        let wordWidth = tempContext.measureText(currentLine + " " + word).width;
        if (wordWidth < tempCanvas.width) {
            currentLine += " " + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);

    // nts: there's DEFINITELY a HEIGHT LIMIT (tempCanvas.height/fontHeight), but its just funny for now lol
    let currLineHeight = tempCanvas.height/2 - (lines.length-1)*fontHeight/2;
    for (let line of lines){
        tempContext.fillText(line, tempCanvas.width/2, currLineHeight, tempCanvas.width);
        currLineHeight += fontHeight;
    }

    createItemFromTextfield.value = "";
    createListItem(tempContext.canvas.toDataURL());
}
function createListItem(imageUrl){
    if (nextItemId == Number.MAX_SAFE_INTEGER){
        throw new Error("idk how but you've made an insurmountable amount of items. restart the page");
    }
    const imageDiv = document.createElement("div");
    imageDiv.classList.add("list-item");
    imageDiv.id = "item-" + nextItemId.toString();
    nextItemId += 1;
    imageDiv.draggable = true;
    imageDiv.addEventListener("dragstart", function() { drag(event, imageDiv); });
    imageDiv.addEventListener("dragend", function() { drop(event, imageDiv); });
    const imageNode = document.createElement("img");
    imageNode.src = imageUrl;
    imageDiv.appendChild(imageNode);
    unlistedListItems.appendChild(imageDiv);
    if(!keepItemModalOpenCB.checked) closeModal();
}
/*
Modal: Row Management Functions
*/
var rowColorPicker = document.getElementById("row-color-picker");
var selectedRowEl = null;
var tierlistTableBody = document.getElementById("tierlist-table-body");
function openRowOptionsModal(el){
    // NTS: Have the options button itself pass the parent^3
    selectedRowEl = el.parentNode.parentNode.parentNode;
    rowColorPicker.value = rgb2hex(selectedRowEl.querySelector(".row-label").style.backgroundColor);
    theRowOptionsModal.style.display = "block";
}
function createRow(placeAbove){
    const rowEl = document.createElement("tr");

    const rowLabel = document.createElement("td");
    rowLabel.classList.add("row-label");
    rowLabel.style.backgroundColor = "#ffffff";
    const rowLabelTextArea = document.createElement("textarea");
    rowLabelTextArea.addEventListener("dragover", function(event){
        event.preventDefault();
    });
    rowLabelTextArea.addEventListener("input", function(){ autoGrow(rowLabelTextArea); });
    rowLabelTextArea.spellcheck = false;
    rowLabelTextArea.value = "RowLabel";
    rowLabel.appendChild(rowLabelTextArea);

    const rowItems = document.createElement("td");
    rowItems.classList.add("row-items");
    rowItems.addEventListener("dragover", function(){ previewDrop(event, rowItems); });

    const rowOptions = document.createElement("td");
    rowOptions.classList.add("row-options");
    const rowOptionsDiv = document.createElement("div");
    rowOptionsDiv.classList.add("row-options-cont");
    
    const rowSettingsBtn = document.createElement("div");
    rowSettingsBtn.addEventListener("click", function() { openRowOptionsModal(rowSettingsBtn); });
    rowSettingsBtn.classList.add("row-settings-btn");
    rowSettingsBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-settings-filled" width="40" height="40" viewBox="0 0 24 24" stroke-width="1.5" stroke="#ffffff" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M14.647 4.081a.724 .724 0 0 0 1.08 .448c2.439 -1.485 5.23 1.305 3.745 3.744a.724 .724 0 0 0 .447 1.08c2.775 .673 2.775 4.62 0 5.294a.724 .724 0 0 0 -.448 1.08c1.485 2.439 -1.305 5.23 -3.744 3.745a.724 .724 0 0 0 -1.08 .447c-.673 2.775 -4.62 2.775 -5.294 0a.724 .724 0 0 0 -1.08 -.448c-2.439 1.485 -5.23 -1.305 -3.745 -3.744a.724 .724 0 0 0 -.447 -1.08c-2.775 -.673 -2.775 -4.62 0 -5.294a.724 .724 0 0 0 .448 -1.08c-1.485 -2.439 1.305 -5.23 3.744 -3.745a.722 .722 0 0 0 1.08 -.447c.673 -2.775 4.62 -2.775 5.294 0zm-2.647 4.919a3 3 0 1 0 0 6a3 3 0 0 0 0 -6z" stroke-width="0" fill="currentColor" /></svg>';
    
    const moveRowButtonsDiv = document.createElement("div");
    const moveRowUpBtn = document.createElement("div");
    moveRowUpBtn.classList.add("move-row-up-btn");
    moveRowUpBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-arrow-big-up-filled" width="28" height="28" viewBox="0 0 24 24" stroke-width="1.5" stroke="#ffffff" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10.586 3l-6.586 6.586a2 2 0 0 0 -.434 2.18l.068 .145a2 2 0 0 0 1.78 1.089h2.586v7a2 2 0 0 0 2 2h4l.15 -.005a2 2 0 0 0 1.85 -1.995l-.001 -7h2.587a2 2 0 0 0 1.414 -3.414l-6.586 -6.586a2 2 0 0 0 -2.828 0z" stroke-width="0" fill="currentColor" /></svg>';
    moveRowUpBtn.addEventListener("click", function() { moveRow(moveUp=true, rowEl); });
    const moveRowDownBtn = document.createElement("div");
    moveRowDownBtn.classList.add("move-row-down-btn");
    moveRowDownBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-arrow-big-down-filled" width="28" height="28" viewBox="0 0 24 24" stroke-width="1.5" stroke="#ffffff" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10 2l-.15 .005a2 2 0 0 0 -1.85 1.995v6.999l-2.586 .001a2 2 0 0 0 -1.414 3.414l6.586 6.586a2 2 0 0 0 2.828 0l6.586 -6.586a2 2 0 0 0 .434 -2.18l-.068 -.145a2 2 0 0 0 -1.78 -1.089l-2.586 -.001v-6.999a2 2 0 0 0 -2 -2h-4z" stroke-width="0" fill="currentColor" /></svg>';
    moveRowDownBtn.addEventListener("click", function() { moveRow(moveUp=false, rowEl); });
    rowOptionsDiv.appendChild(rowSettingsBtn);
    moveRowButtonsDiv.appendChild(moveRowUpBtn);
    moveRowButtonsDiv.appendChild(moveRowDownBtn);
    rowOptionsDiv.appendChild(moveRowButtonsDiv);
    rowOptions.appendChild(rowOptionsDiv);

    rowEl.appendChild(rowLabel);
    rowEl.appendChild(rowItems);
    rowEl.appendChild(rowOptions);
    if(placeAbove){
        tierlistTableBody.insertBefore(rowEl, selectedRowEl);
    }else{
        // nts: interesting "insertAfter" (even works on EOL)
        tierlistTableBody.insertBefore(rowEl, selectedRowEl.nextSibling);
    }
    closeModal();
}
function deleteRow(){
    if (tierlistTableBody.children.length > 1){
        selectedRowEl.remove();
    }
    closeModal();
}
function updateColor(ev){
    if(selectedRowEl == null) return;
    selectedRowEl.querySelector(".row-label").style.backgroundColor = ev.target.value;
}
/*
Row Management Cont: Technically it's in-row, not in-modal
*/
function moveRow(moveUp, rowEl){
    if(moveUp && rowEl.previousElementSibling != null){
        tierlistTableBody.insertBefore(rowEl, rowEl.previousElementSibling);
    }else if(!moveUp && rowEl.nextElementSibling != null){
        tierlistTableBody.insertBefore(rowEl.nextElementSibling , rowEl);
    }
}


/*
Dragging Functions
*/

var dragEl = null;
var dragElNextParent = null;
var dragElNextIdx = 0;

function previewDrop(ev, el){
    if(dragEl == null) return;
    ev.preventDefault();
    const mouseX = ev.clientX;
    const mouseY = ev.clientY;
    // nts: replace mouseX/Y with the calls instead (we only use them once each!)
    const elX = el.getBoundingClientRect().x;
    const elY = el.getBoundingClientRect().y;
    const maxChildrenPerRow = Math.floor(el.getBoundingClientRect().width / listItemHeight);
    let idxInParent = Math.floor((mouseY - elY) / listItemHeight) * maxChildrenPerRow;
    idxInParent += Math.floor((mouseX - elX + (listItemHeight / 2)) / listItemHeight);
    idxInParent = Math.max(idxInParent, 0);
    console.log(idxInParent);
    if(dragEl.parentNode != el || dragElNextIdx != idxInParent){
        if(idxInParent >= el.children.length){
            el.appendChild(dragEl);
        }else{
            el.insertBefore(dragEl, el.children[idxInParent]);
        }
        dragElNextParent = el;
        dragElNextIdx = idxInParent;
    }
}
function drag(ev, el) {
    dragEl = el;
    dragEl.classList.add("dragging");
    dragElNextParent = el.parentNode;
    dragElNextIdx = Array.prototype.indexOf.call(dragElNextParent.children, el);
}
function drop(ev, el) {
    ev.preventDefault();
    if(dragEl != null){
        dragEl.classList.remove("dragging");
        dragEl = null;
    }
}
function openTrash(ev){
    ev.preventDefault();
    if (ev.currentTarget.contains(ev.relatedTarget)) return;
    closedTrashIcon.style.display = "none";
    openTrashIcon.style.display = "block";
}
function closeTrash(ev){
    ev.preventDefault();
    if (ev.currentTarget.contains(ev.relatedTarget)) return;
    closedTrashIcon.style.display = "block";
    openTrashIcon.style.display = "none";
}
function discardItem(ev) {
    if(dragEl != null){
        dragEl.remove();
        dragEl = null;
    }
    closeTrash(ev);
}

/*
Doc Setup Functions
*/
// Clicking outside an open modal, closes the modal
window.addEventListener("click", function(event){
    if(event.target == theCreateItemModal || event.target == theRowOptionsModal){
        closeModal();
    }
});
// Pressing enter on createItemFromTextfield triggers "submit" button onclick()
createItemFromTextfield.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        document.getElementById("create-item-from-text-button").click();
    }
});
// Function to convert rgb values to hex
const rgb2hex = (rgb) => `#${rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/).slice(1).map(n => parseInt(n, 10).toString(16).padStart(2, '0')).join('')}`;
// Create starting tier list rows + items
createListItem("images/leaf.jpg");
createListItem("images/maple leaf.jpg");
createListItem("images/pine leaf.jpg");
// Bit of a mess here
let lastCreatedRow = document.getElementById("tierlist-table-body").children[0];
const createFirstRow = async() => {
    selectedRowEl = lastCreatedRow;
    await createRow(false);
    lastCreatedRow.remove();
    lastCreatedRow = document.getElementById("tierlist-table-body").children[0];
    lastCreatedRow.getElementsByClassName("row-label")[0].style.backgroundColor = "#ff0000";
    lastCreatedRow.querySelectorAll("textarea")[0].value = "A";
};
const createSecondRow = async() => {
    await createFirstRow();
    selectedRowEl = lastCreatedRow;
    await createRow(false);
    lastCreatedRow = document.getElementById("tierlist-table-body").children[1];
    lastCreatedRow.getElementsByClassName("row-label")[0].style.backgroundColor = "#ff8000";
    lastCreatedRow.querySelectorAll("textarea")[0].value = "B";
};
const createThirdRow = async() => {
    await createSecondRow();
    selectedRowEl = lastCreatedRow;
    await createRow(false);
    lastCreatedRow = document.getElementById("tierlist-table-body").children[2];
    lastCreatedRow.getElementsByClassName("row-label")[0].style.backgroundColor = "#ffff00";
    lastCreatedRow.querySelectorAll("textarea")[0].value = "C";
};
createThirdRow();

