import randomColor from '../core/randomColor';

export default function makeAvailablePeerElement(id, name) {
    let el = document.createElement('div');
    el.classList.add('available-peers__peer');

    let circleEl = document.createElement('div');
    circleEl.classList.add('available-peers__circle');
    circleEl.innerHTML = name.charAt(0).toUpperCase();
    circleEl.style.backgroundColor = randomColor();
    el.append(circleEl);

    let nameEl = document.createElement('div');
    nameEl.classList.add('available-peers__name');
    nameEl.innerHTML = name;
    el.append(nameEl);

    el.peerId = id;
    el.name = name;

    return el;
}