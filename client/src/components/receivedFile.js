export default function makeReceivedFileElement(imgUrl) {
    let el = document.createElement('div');
    el.classList.add('received_files__file');
    el.style.backgroundImage = `url('${imgUrl}')`;
    return el;
}