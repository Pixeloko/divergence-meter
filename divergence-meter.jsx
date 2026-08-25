export const command = 'date "+%S"';
export const refreshFrequency = 3600000; // Refresh every hour

export const className = `
  .divergence-container {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 15px;
    position: absolute; 
    top: 50%;          
    left: 50%; 
    cursor: grab;
  }

  .tube-image {
    height: 150px;
    border-radius: 40px;
    width: 50px;
    display: block;
  }

  .refresh-button {
    position: absolute;
    bottom: 5px; 
    left: 50%; 
    transform: translateX(-50%); 
    height: 20px;
    width: 60px;
    background-color: #000000; 
    border: 0.5px solid #050505; 
    cursor: pointer;
    font-family: Courier New;
    font-size: 15px;
    color: #e38b38;
    text-align: center;
  }
  
  .refresh-button:hover {
    background-color: #e38b38;
    color: #000000;
  }
`;

export const render = () => {
  return (
    <div className="divergence-container" id="divergenceWidget">
      <button
        className="refresh-button"
        onClick={handleManualRefresh}
        title="Force refresh"
        text="Shift"
      >
        SHIFT
      </button>

      {Array.from({ length: 8 }).map((_, index) => (
        // Create 9 place holders for updateState to generate the divergence
        <img key={index} id={`tube-${index}`} className="tube-image" />
      ))}
    </div>
  );
};

function makeDraggable() {
  const widget = document.getElementById("divergenceWidget");
  if (!widget) return;

  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

  widget.onmousedown = dragMouseDown;

  function dragMouseDown(e) {
    e = e || window.event;
    // do not drag if button is clicked
    if (e.target.className === 'refresh-button') return;
    
    e.preventDefault(); // do not grab the image
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    widget.style.top = (widget.offsetTop - pos2) + "px";
    widget.style.left = (widget.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

// Declare the transition variables
let isTransitioning = false;
let skipNextAutoRefresh = false;

function handleManualRefresh() {
  // Button
  if (isTransitioning) return;
  skipNextAutoRefresh = true;
  triggerRefresh();
}

function triggerRefresh() {
  // Auto and Manual refresh
  if (isTransitioning) return;

  const imageMap = {
    0: "divergence-meter.widget/assets/0.png",
    1: "divergence-meter.widget/assets/1.png",
    2: "divergence-meter.widget/assets/2.png",
    3: "divergence-meter.widget/assets/3.png",
    4: "divergence-meter.widget/assets/4.png",
    5: "divergence-meter.widget/assets/5.png",
    6: "divergence-meter.widget/assets/6.png",
    7: "divergence-meter.widget/assets/7.png",
    8: "divergence-meter.widget/assets/8.png",
    9: "divergence-meter.widget/assets/9.png",
    ".": "divergence-meter.widget/assets/dot.png",
  };
  const gifPath = "divergence-meter.widget/assets/transition.gif";

  isTransitioning = true; // avoid refresh collision (lock)
  for (let i = 0; i < 8; i++) {
    const imgElement = document.getElementById(`tube-${i}`);
    if (imgElement) {
      imgElement.src = gifPath; // replace tube by GIF
      imgElement.style.display = "block";
    }
  }

  setTimeout(() => {
    const divergenceValue = (Math.random() * 4).toFixed(6);
    const chars = divergenceValue.split("");

    for (let i = 0; i < 8; i++) {
      const imgElement = document.getElementById(`tube-${i}`);
      if (!imgElement) continue;

      const char = chars[i];
      imgElement.style.display = "block";
      imgElement.src = imageMap[char] || "";
    }

    isTransitioning = false; // release
  }, 350);
}

let isDraggableInit = false;
export const updateState = (event, previousState) => {
  if (!isDraggableInit) {
    makeDraggable();
    isDraggableInit = true;
  }
  
  // Called for every refresh
  if (skipNextAutoRefresh) {
    skipNextAutoRefresh = false;
    return;
  }
  triggerRefresh();
};
