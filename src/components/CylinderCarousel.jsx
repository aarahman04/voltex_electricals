import { useEffect, useRef, useState } from "react";
import { useAnimationFrame, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { cdnImage } from "../lib/image.js";
import { displayTitle } from "../lib/specSummary.js";

const PLATE_W = 208;
const PERSPECTIVE = 1400;
const DRIFT_DEG_PER_SEC = 5;

// The hero: product plates stood on a slowly turning drum. Drag or swipe
// spins it; it drifts on its own when left alone and stops on hover or
// focus. Under reduced motion or on a narrow screen it becomes a plain
// snap-scrolling rail — every plate is a real link either way.
export default function CylinderCarousel({ products }) {
  const reduceMotion = useReducedMotion();
  const [isRail, setIsRail] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setIsRail(reduceMotion || !mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [reduceMotion]);

  if (isRail) return <Rail products={products} />;
  return <Wheel products={products} />;
}

function Rail({ products }) {
  return (
    <div className="thin-scroll flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 sm:px-8">
      {products.map((product) => (
        <div key={product.uid} className="snap-center shrink-0">
          <Plate product={product} />
        </div>
      ))}
    </div>
  );
}

function Wheel({ products }) {
  const count = products.length;
  const angle = 360 / count;
  const radius = Math.round(PLATE_W / 2 / Math.tan((angle / 2) * (Math.PI / 180)));

  const drum = useRef(null);
  const rotation = useRef(0);
  const paused = useRef(false);
  const dragging = useRef(false);
  const moved = useRef(false);
  const lastFrame = useRef(0);

  const apply = () => {
    if (drum.current) {
      drum.current.style.transform = `rotateY(${rotation.current}deg)`;
    }
  };

  useAnimationFrame((t) => {
    const dt = lastFrame.current ? (t - lastFrame.current) / 1000 : 0;
    lastFrame.current = t;
    if (!paused.current && !dragging.current) {
      rotation.current += DRIFT_DEG_PER_SEC * dt;
      apply();
    }
  });

  const onPointerDown = (event) => {
    dragging.current = true;
    moved.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event) => {
    if (!dragging.current) return;
    if (Math.abs(event.movementX) > 2) moved.current = true;
    rotation.current += event.movementX * 0.4;
    apply();
  };
  const endDrag = () => {
    dragging.current = false;
  };
  // A drag that ends on a plate shouldn't also open it.
  const onClickCapture = (event) => {
    if (moved.current) {
      event.preventDefault();
      event.stopPropagation();
      moved.current = false;
    }
  };
  const step = (dir) => {
    rotation.current -= dir * angle;
    apply();
  };

  return (
    <div
      className="relative mx-auto h-[360px] w-full max-w-[600px] cursor-grab touch-none select-none active:cursor-grabbing sm:h-[440px]"
      style={{ perspective: `${PERSPECTIVE}px` }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onClickCapture={onClickCapture}
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}
      onFocusCapture={() => (paused.current = true)}
      onBlurCapture={() => (paused.current = false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") step(-1);
        if (e.key === "ArrowRight") step(1);
      }}
    >
      <div ref={drum} className="absolute inset-0 [transform-style:preserve-3d]">
        {products.map((product, i) => (
          <div
            key={product.uid}
            className="absolute left-1/2 top-1/2 [backface-visibility:hidden]"
            style={{
              transform: `translate(-50%, -50%) rotateY(${i * angle}deg) translateZ(${radius}px)`,
            }}
          >
            <Plate product={product} />
          </div>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-ground-deep to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-ground-deep to-transparent" />
    </div>
  );
}

function Plate({ product }) {
  const title = displayTitle(product);
  return (
    <Link
      to={`/product/${product.uid}`}
      className="group block w-[184px] overflow-hidden rounded-[4px] bg-plate-dim sm:w-[192px]"
      draggable={false}
    >
      <div className="relative aspect-square bg-plate">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(58% 52% at 50% 42%, #fffdf9 0%, rgba(255,253,249,0) 78%)",
          }}
        />
        <img
          src={cdnImage(product.images?.primary, 360)}
          alt={title}
          draggable={false}
          className="h-full w-full object-contain mix-blend-multiply p-6 transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="bg-ground-lift px-3 py-2.5">
        <span className="line-clamp-1 text-[12px] font-medium text-ivory">
          {title}
        </span>
      </div>
    </Link>
  );
}
