(() => {
    const dialog = document.getElementById('preloader');
    const dot = dialog.querySelector('.storm-dot');
    const ring = dialog.querySelector('.storm-ring');
    const root = document.documentElement;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let x, y, dotX, dotY, ringX, ringY, lastTime, frame = 0;
    const cv = document.getElementById('cv-dialog');
    const certificate = document.getElementById('certificate-dialog');
    function place() {
        (certificate?.open ? certificate : cv?.open ? cv : dialog.open ? dialog : document.body).append(dot, ring);
    }
    const observer = new MutationObserver(place);
    for (const modal of [dialog, cv, certificate].filter(Boolean)) {
        observer.observe(modal, {attributes:true, attributeFilter:['open']});
    }
    place();
    function draw(time) {
        const dt = Math.min(64, Math.max(1, time - lastTime));
        lastTime = time;
        const follow = reduced.matches ? 1 : -Math.expm1(-dt / 36);
        const trail = reduced.matches ? 1 : -Math.expm1(-dt / 165);
        dotX += (x-dotX)*follow;
        dotY += (y-dotY)*follow;
        ringX += (x-ringX)*trail;
        ringY += (y-ringY)*trail;
        dot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;
        ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
        frame = Math.hypot(x-ringX,y-ringY)+Math.hypot(x-dotX,y-dotY)>.05 ? requestAnimationFrame(draw) : 0;
    }
    function hide() {
        root.classList.remove('orb-active');
        cancelAnimationFrame(frame);
        frame=0;
    }
    function move(event) {
        if(event.pointerType!=='mouse'){hide();return}
        x=event.clientX; y=event.clientY;
        if(!root.classList.contains('orb-active')){
            dotX=ringX=x; dotY=ringY=y;
            root.classList.add('orb-active');
        }
        if(!frame){lastTime=performance.now();draw(lastTime)}
    }
    window.addEventListener('pointermove',move,{passive:true});
    window.addEventListener('pointerdown',move,{passive:true});
    document.documentElement.addEventListener('pointerleave',hide);
    window.addEventListener('blur',hide);
})();
