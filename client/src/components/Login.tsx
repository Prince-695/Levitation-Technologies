import { useEffect, useRef } from "react";
import AuthForm from "./Authform";
import frameA from "../assets/frameA.png";
import frameB from "../assets/frameB.png";

export default function Login() {
  const trackRef = useRef(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let x = 0;                          // current translateX
    const SPEED = 0.35;                 // px per frame (slow + smooth)
    let rafId;

    // helper: width including horizontal margins
    const totalWidth = (el) => {
      const cs = getComputedStyle(el);
      const ml = parseFloat(cs.marginLeft) || 0;
      const mr = parseFloat(cs.marginRight) || 0;
      return el.offsetWidth + ml + mr;
    };

    const step = () => {
      x -= SPEED;
      track.style.transform = `translateX(${x}px)`;

      // When the first child is fully out of view, move it to the end
      const first = track.children[0];
      if (first) {
        const w = totalWidth(first);
        // If we've shifted past the first element's full width, recycle it
        if (-x >= w) {
          track.appendChild(first);   // put first at the end
          x += w;                     // compensate so there's no jump
          track.style.transform = `translateX(${x}px)`;
        }
      }

      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div className="flex h-full w-full items-center justify-center overflow-hidden mt-16">
      {/* Slider Section */}
      <div className="xl:flex w-1/2 flex-row items-center justify-center overflow-hidden hidden">
        <div
          ref={trackRef}
          className="flex items-center will-change-transform"
          style={{ transform: "translateX(0px)" }}
        >
          {/* Give each image a stable index */}
          <img
            src={frameA}
            alt="hello"
            height={600}
            width={400}
            data-index="0"
            className="m-5"
          />
          <img
            src={frameB}
            alt="world"
            height={600}
            width={400}
            data-index="1"
            className="m-5"
          />
        </div>
      </div>

      {/* Auth Form */}
      <div className="flex w-1/2 items-center justify-center ml-5">
        <AuthForm mode="login" />
      </div>
    </div>
  );
}
