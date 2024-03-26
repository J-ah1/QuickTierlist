/*
Global Variables
*/
var theCreateItemModal = document.getElementById("create-item-modal");
var theRowOptionsModal = document.getElementById("row-options-modal");
var fileUploadInput = document.getElementById("file-uploader");
var createItemFromTextfield = document.getElementById("create-item-from-text-field");
var unlistedListItems = document.getElementById("unlisted-list-items")
var nextItemId = 1; // NTS: Does NOT correlate to num of items

/*
Tier List Functions
*/
function autoGrow(element) {
    element.style.height = "5px";
    element.style.height = (element.scrollHeight) + "px";
    // Future note: should update every (var(--list-item-height)) instead
}

/*
Modal Functions
*/
function openCreateItemModal(){
    theCreateItemModal.style.display = "block";
}
function openRowOptionsModal(rowId){
    theRowOptionsModal.style.display = "block";
}
function closeModal(){
    theCreateItemModal.style.display = "none";
    theRowOptionsModal.style.display = "none";
}
function uploadImage(){
    for (let file of fileUploadInput.files){
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
    createListItem(tempContext.canvas.toDataURL());
}
function createListItem(imageUrl){
    if (nextItemId == Number.MAX_SAFE_INTEGER){
        throw new Error("idk how but you've made an insurmountable amount of items. restart the page");
    }
    const imageDiv = document.createElement("div");
    imageDiv.setAttribute("class", "list-item");
    imageDiv.setAttribute("id", "item-" + nextItemId.toString());
    nextItemId += 1;
    imageDiv.setAttribute("draggable", true);
    imageDiv.ondragstart = function() {
        drag(event, imageDiv);
    }
    imageDiv.ondragend = function() {
        drop(event, imageDiv);
    }
    const imageNode = document.createElement("img");
    imageNode.setAttribute("src", imageUrl);
    imageDiv.appendChild(imageNode)
    unlistedListItems.appendChild(imageDiv);
    closeModal();
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
    let mouseX = ev.clientX;
    let elX = el.getBoundingClientRect().x;
    let idxInParent = Math.max(Math.floor((mouseX - elX) / 100), 0);
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
    dragEl.classList.remove("dragging");
    dragEl = null;
}
function discardItem(ev) {
    dragEl.remove();
    dragEl = null;
}

/*
Doc Setup Functions
*/
// Clicking outside an open modal, closes the modal
window.onclick = function(event){
    if(event.target == theCreateItemModal || event.target == theRowOptionsModal){
        closeModal();
    }
}
// Pressing enter on createItemFromTextfield triggers "submit" button onclick()
createItemFromTextfield.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        document.getElementById("create-item-from-text-button").click();
    }
});
