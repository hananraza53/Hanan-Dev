// One viewport-sized constellation follows the intro into the portfolio.
(() => {
    const canvas = document.getElementById('particleCanvas');
    const dialog = document.getElementById('preloader');
    const context = canvas.getContext('2d');
    if (!context) return;
    const anchor = document.createComment('Portfolio star field');
    canvas.before(anchor);
    const pointer = {x: null, y: null};
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let width, height, stars, previous = 0;
    function place() {
        if (dialog.open) dialog.prepend(canvas);
        else anchor.after(canvas);
    }
    new MutationObserver(place).observe(dialog, {attributes:true, attributeFilter:['open']});
    place();
    function resize() {
        width = innerWidth;
        height = innerHeight;
        const scale = Math.min(devicePixelRatio || 1, 1.6);
        canvas.width = Math.round(width * scale);
        canvas.height = Math.round(height * scale);
        context.setTransform(scale, 0, 0, scale, 0, 0);
        const count = Math.max(38, Math.min(140, Math.round(width * height / 6800)));
        stars = Array.from({length:count}, () => ({
            x:Math.random()*width, y:Math.random()*height,
            vx:(Math.random()-.5)*19, vy:(Math.random()-.5)*19,
            r:.65+Math.random()**2*1.85, alpha:.35+Math.random()*.46
        }));
    }
    resize();
    addEventListener('resize', resize);
    addEventListener('pointermove', e => {pointer.x=e.clientX; pointer.y=e.clientY});
    function clearPointer(){pointer.x=null;pointer.y=null}
    document.addEventListener('pointerleave',clearPointer);
    addEventListener('pointerup',e=>{if(e.pointerType!=='mouse')clearPointer()});
    function line(x,y,endX,endY,opacity) {
        context.globalAlpha=opacity;
        context.beginPath();
        context.moveTo(x,y); context.lineTo(endX,endY); context.stroke();
    }
    function draw(now) {
        if (now - previous < 1000 / 32) { requestAnimationFrame(draw); return; }
        const dt = motion.matches ? 0 : Math.min((now-previous)/1000,.05);
        previous=now;
        context.clearRect(0,0,width,height);
        context.fillStyle=context.strokeStyle=document.documentElement.dataset.theme==='light'?'#000':'#fff';
        context.lineWidth=.85;
        for(let i=0;i<stars.length;i++){
            const s=stars[i];
            s.x=(s.x+s.vx*dt+width)%width; s.y=(s.y+s.vy*dt+height)%height;
            context.globalAlpha=s.alpha;
            context.beginPath(); context.arc(s.x,s.y,s.r,0,2*Math.PI); context.fill();
            for(let j=i+1;j<stars.length;j++){
                const other=stars[j], dx=s.x-other.x,dy=s.y-other.y,d2=dx*dx+dy*dy;
                if(d2<8100) line(s.x,s.y,other.x,other.y,.23*(1-Math.sqrt(d2)/90));
            }
            if(pointer.x!==null){
                const d=Math.hypot(s.x-pointer.x,s.y-pointer.y);
                if(d<148)line(s.x,s.y,pointer.x,pointer.y,.48*(1-d/148));
            }
        }
        requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
})();
