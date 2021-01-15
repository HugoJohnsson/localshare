export default function makeReceivedFileElement(imgUrl, meta) {
    let el = document.createElement('div');
    el.classList.add('received_files__file');

    let imgEl = document.createElement('img');
    imgEl.classList.add('received_files__image');
    imgEl.src = imgUrl;
    el.append(imgEl);

    let info = document.createElement('div');
    info.classList.add('received_files__image');

    let name = document.createElement('p');
    name.classList.add('received_files__name');
    name.textContent = meta.name;
    info.append(name);

    let size = document.createElement('p');
    size.classList.add('received_files__size');
    size.textContent = meta.size + ' bytes';
    info.append(size);

    el.append(info);

    return el;
}