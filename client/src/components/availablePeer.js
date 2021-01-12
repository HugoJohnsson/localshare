import randomColor from '../core/randomColor';
import Events from '../core/Events';
import EventType from '../core/model/EventType';

export default function makeAvailablePeerElement(peerId, name) {
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

    el.peerId = peerId;
    el.name = name;

    // Event listeners
    el.addEventListener('click', () => Events.trigger(EventType.CALL, { receivingPeerId: peerId })); // Trigger CALL event when you click on a peer because this means you want to connect to the peer

    return el;
}