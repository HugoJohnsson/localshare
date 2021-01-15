export default function makeProcessingFileElement(imgUrl, meta) {
    let el = document.createElement('div');
    el.classList.add('files__processing_file');

    let imgEl = document.createElement('img');
    imgEl.classList.add('files__processing_file_image');
    imgEl.src = imgUrl;
    el.append(imgEl);

    let info = document.createElement('div');
    info.classList.add('files__processing_file_info');

    let name = document.createElement('p');
    name.classList.add('files__processing_file_name');
    name.textContent = meta.name;
    info.append(name);

    let size = document.createElement('p');
    size.classList.add('files__processing_file_size');
    size.textContent = meta.size + ' bytes';
    info.append(size);

    let status = document.createElement('p');
    status.classList.add('files__processing_file_status');
    status.textContent = 'Uploading';
    info.append(status);

    el.append(info);

    // Set the fileName on the element so that we can find it later when we update the status
    el.fileName = meta.name;

    return el;
}