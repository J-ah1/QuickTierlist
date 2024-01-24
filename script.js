var createItemModal = document.getElementById("create-item-modal");

function autoGrow(element) {
    element.style.height = "5px";
    element.style.height = (element.scrollHeight) + "px";
}

function openModal(){
    createItemModal.style.display = "block";
}

function closeModal(){
    createItemModal.style.display = "none";
}

window.onclick = function(event){
    if(event.target == createItemModal){
        closeModal();
    }
}