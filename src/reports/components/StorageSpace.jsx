class StorageControl {
  constructor(getStorage) {
    this.getStorage = getStorage;
  }

  onAdd(map) {
    this.map = map;

    this.button = document.createElement('button');
    this.button.className = 'maplibregl-ctrl-icon';
    this.button.type = 'button';
    this.button.innerHTML = "💾";

    this.button.addEventListener("mouseenter", () => this.showPopup());
    this.button.addEventListener("mouseleave", () => this.hidePopup());

    this.container = document.createElement('div');
    this.container.className = 'maplibregl-ctrl-group maplibregl-ctrl';
    this.container.style.position = "relative";
    
    this.container.appendChild(this.button);

    // Tooltip
    this.popup = document.createElement('div');
    this.popup.style.display = "none";
    this.popup.style.position = "fixed";
    this.popup.style.right = "100%"; 
    this.popup.style.top = "50%";
    this.popup.style.transform = "translateY(-50%)";
    this.popup.style.background = "#fff";
    this.popup.style.padding = "6px 10px";
    this.popup.style.borderRadius = "6px";
    this.popup.style.boxShadow = "0 2px 6px rgba(0,0,0,0.25)";
    this.popup.style.fontSize = "12px";
    this.popup.style.whiteSpace = "nowrap";
    this.popup.style.zIndex = "10000";

    this.container.appendChild(this.popup);

    return this.container;
  }

  onRemove() {
    this.container.remove();
  }

  async showPopup() {
    const { percent } = await this.getStorage();
    this.popup.innerHTML = `<b>${percent}% Used</b>`;
    this.popup.style.display = "block";
  }

  hidePopup() {
    this.popup.style.display = "none";
  }
}

export default StorageControl;