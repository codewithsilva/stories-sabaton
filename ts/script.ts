import Slide from "./Slide";

export function handleSlide() {
  const container = document.getElementById('slide'),
        elements = document.getElementById('slide-elements'),

        controls = document.getElementById('slide-controls'),
        playPause = document.querySelector('.play-pause')

  console.log(container, elements, controls, playPause)

  if (container && elements && 
      controls && elements.children.length && playPause) {

  const stories = new Slide(
    container,
    Array.from(elements.children),
    controls,
    playPause,
    5000)
  }
}
