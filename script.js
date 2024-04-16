/*
Global Variables
*/
var theCreateItemModal = document.getElementById("create-item-modal");
var theRowOptionsModal = document.getElementById("row-options-modal");
var fileUploadInput = document.getElementById("file-uploader");
var createItemFromTextfield = document.getElementById("create-item-from-text-field");
var unlistedListItems = document.getElementById("unlisted-list-items");
var nextItemId = 1; // NTS: Does NOT correlate to num of items
var listItemHeight = parseInt(getComputedStyle(document.body).getPropertyValue("--list-item-height"));

/*
Tier List Functions
*/
function autoGrow(element) {
    element.style.height = "5px";
    element.style.height = (element.scrollHeight) + "px";
    // Future note: should update every (var(--list-item-height)) instead
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
// Create a list-item image from the "createItemFromTextfield" value
function createImageFromText(){
    const canvasText = createItemFromTextfield.value;
    const tempCanvas = document.createElement("canvas");
    const tempContext = tempCanvas.getContext("2d");
    tempCanvas.width = 100;
    tempCanvas.height = 100;
    tempContext.fillStyle = "white";
    tempContext.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    tempContext.fillStyle = "black";
    tempContext.font = "48px serif";
    tempContext.textBaseline = 'middle';
    tempContext.fillText(canvasText, 0, tempCanvas.height/2, 100);
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
    closeModal();
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
    rowLabelTextArea.value = "RowLabel";
    rowLabel.appendChild(rowLabelTextArea);

    const rowItems = document.createElement("td");
    rowItems.classList.add("row-items");
    rowItems.addEventListener("dragover", function(){ previewDrop(event, rowItems); });

    const rowOptions = document.createElement("td");
    rowOptions.classList.add("row-options");
    const rowOptionsDiv = document.createElement("div");
    rowOptionsDiv.classList.add("row-options-cont");

    const moveRowUpBtn = document.createElement("span");
    moveRowUpBtn.classList.add("move-row-up-btn");
    moveRowUpBtn.innerHTML = "&and;";
    moveRowUpBtn.addEventListener("click", function() { moveRow(moveUp=true, rowEl); });
    const rowOptionsBtn = document.createElement("button");
    rowOptionsBtn.addEventListener("click", function() { openRowOptionsModal(rowOptionsBtn); });
    rowOptionsBtn.innerHTML = "Options";
    const moveRowDownBtn = document.createElement("span");
    moveRowDownBtn.classList.add("move-row-down-btn");
    moveRowDownBtn.innerHTML = "&or;";
    moveRowDownBtn.addEventListener("click", function() { moveRow(moveUp=false, rowEl); });
    rowOptionsDiv.appendChild(moveRowUpBtn);
    rowOptionsDiv.appendChild(rowOptionsBtn);
    rowOptionsDiv.appendChild(moveRowDownBtn);
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
    selectedRowEl.remove();
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
    const elX = el.getBoundingClientRect().x;
    const idxInParent = Math.max(Math.floor((mouseX - elX + (listItemHeight / 2)) / listItemHeight), 0);
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
function discardItem() {
    if(dragEl != null){
        dragEl.remove();
        dragEl = null;
    }
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
selectedRowEl = document.getElementById("tierlist-table-body").children[0];
createRow(false);
selectedRowEl = document.getElementById("tierlist-table-body").children[0];
createRow(false);
