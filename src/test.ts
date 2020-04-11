export function test() {
    const items = [];
    for (const li of document.getElementsByClassName("drag"))
        items.push(li);


    document.onmousedown = function(evt: MouseEvent) {
        const target = evt.target as HTMLElement;
        if (target?.localName == "div") {
            let mx = evt.clientX;
            let my = evt.clientY;

            const idx = items.indexOf(target);
            let trackIdx = idx;
            const bounds = target.getBoundingClientRect();

            const parent = target.parentElement;

            document.body.appendChild(target);
            target.style.position = 'fixed';
            target.style.top = `${bounds.top}px`;
            target.style.left = `${bounds.left}px`;
            target.style.width = `${bounds.width}px`;
            target.style.height = `${bounds.height}px`;

            target.style.boxShadow = "rgba(100, 100, 100, 0.4) 2px 2px 6px";
            for (let l = 0; l < idx; l++) {
                items[l].style.transform = `translate(0px, 0px)`
            }
            for (let l = idx + 1; l < items.length; l++) {
                items[l].style.transform = `translate(0px, ${bounds.height}px)`
            }

            const virtualOrder = [].concat(items);
            virtualOrder.splice(idx, 1);
            const virtualBounds= virtualOrder.map(item=>{
                const bounds = item.getBoundingClientRect();
                return {
                    left: bounds.left,
                    top: bounds.top,
                    height: bounds.height
                }
            })

            function mousemove(evt: MouseEvent) {
                const dy = evt.clientY - my;
                target.style.transform = `translate(0px, ${dy}px)`;
                const currentBounds = target.getBoundingClientRect();

                if (trackIdx < virtualOrder.length) {
                    const nextEl = virtualOrder[trackIdx];
                    const nextBounds = virtualBounds[trackIdx];
                    if (currentBounds.bottom > (nextBounds.top + nextBounds.height / 2)) {
                        nextEl.style.transition = `transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)`
                        nextEl.style.transform = `translate(0px, 0px)`;
                        nextBounds.top -= bounds.height;
                        trackIdx++;
                    }
                }
                const prevIdx = trackIdx - 1;
                if (prevIdx >= 0) {
                    const prevEl = virtualOrder[prevIdx];
                    const prevBounds = virtualBounds[prevIdx];
                    if (currentBounds.top < (prevBounds.top + prevBounds.height / 2)) {
                        prevEl.style.transition = `transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)`;
                        prevEl.style.transform = `translate(0px, ${bounds.height}px)`;
                        prevBounds.top += bounds.height;
                        trackIdx--;
                    }
                }

            }

            function mouseup(evt: MouseEvent) {
                window.onmousemove = null;
                window.onmouseup = null;
                target.style.transform = null;

                parent.insertBefore(target, items[idx + 1]);

                for (let l = 0; l < items.length; l++) {
                    items[l].style.transform = `translate(0px, 0px)`
                    items[l].style.transition = null;
                }
                target.style.position = null;
                target.style.top = null;
                target.style.left = null;
                target.style.width = null;
                target.style.height = null;
                target.style.boxShadow = null;
            }

            window.onmousemove = mousemove;
            window.onmouseup = mouseup;

            evt.preventDefault();
        }
    }
}