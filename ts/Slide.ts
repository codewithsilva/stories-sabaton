import Timeout from "./Timeout"

export default class Slide {
  container: Element;
  elements: Element[];
  controls: Element;
  playPause: Element;

  time: number;
  index: number;
  slide: Element;
  timeout: Timeout | null;

  paused: boolean;
  pausedTimeout: Timeout | null;
  thumbItems: HTMLElement[] | null;
  thumb: HTMLElement | null;

  constructor(
    container: Element,
    elements: Element[],

    controls: Element,
    playPause: Element,
    time: number = 5000
  ) {
    this.container = container
    this.elements = elements
    this.controls = controls
    this.playPause = playPause
    this.time = time

    this.timeout = null
    this.pausedTimeout = null

    this.index = localStorage.getItem('activeStories') ?
      Number(localStorage.getItem('activeStories')) : 0

    this.slide = this.elements[this.index]
    this.paused = false
    this.thumbItems = null
    this.thumb = null

    this.init()
  }

  hide(el: Element) {
    const button = document.querySelector(".more")

    if (button?.classList.contains("active"))
      button?.classList.remove("active")

    el.classList.remove('active')

    if (el instanceof HTMLVideoElement) {
      el.pause()
      el.muted = true
      el.currentTime = 0
    }
  }

  show(index: number) {
    this.index = index
    this.slide = this.elements[this.index]

    localStorage.setItem('activeStories', String(this.index))
    if (this.thumbItems) {
      this.thumb = this.thumbItems[this.index]
      this.thumbItems.forEach(items => items.classList.remove('active'))
      this.thumb.classList.add("active")
    }

    this.elements.forEach(el => this.hide(el))
    this.slide.classList.add("active")

    if (this.slide instanceof HTMLVideoElement)
      this.autoVideo(this.slide)

    else
      this.auto(this.time)
  }

  autoVideo(video: HTMLVideoElement) {
    const button = document.querySelector(".more")

    if (!button?.classList.contains("active"))
      button?.classList.add("active")

    video.play()
    video.muted = false
    let firstPlay = true

    video.addEventListener('playing', () => {
      if (firstPlay) this.auto(video.duration * 1000)

      firstPlay = false
    })
  }

  auto(time: number) {
    this.timeout?.clear()
    this.timeout = new Timeout(() => this.next(), time)

    if (this.thumb)
      this.thumb.style.animationDuration = `${time}ms`
  }

  prev() {
    if (this.paused) return

    const prev =
      this.index - 1 >= 0 ? this.index - 1 : this.elements.length - 1

    this.show(prev)
  }

  next() {
    if (this.paused) return

    const next =
      this.index + 1 < this.elements.length ?
        this.index + 1 : 0

    this.show(next)
  }

  pause() {
    document.body.classList.add("paused")
    window.oncontextmenu = () => { return false }

    this.pausedTimeout = new Timeout(() => {
      this.timeout?.pause()
      this.paused = true
      this.thumb?.classList.add('paused')

      if (this.slide instanceof HTMLVideoElement)
        this.slide.pause()

      if (this.playPause.classList.contains('pause')) {
        this.playPause.classList.remove('pause')
        this.playPause.classList.add('play')
      }
    }, 300)
  }

  continue() {
    document.body.classList.remove("paused")
    this.pausedTimeout?.clear()

    if (this.paused) {
      this.paused = false
      this.timeout?.continue()
      this.thumb?.classList.remove('paused')

      if (this.slide instanceof HTMLVideoElement)
        this.slide.play()
    }

    if (this.playPause.classList.contains('play')) {
      this.playPause.classList.remove('play')
      this.playPause.classList.add('pause')
    }
  }

  private addControl() {
    const prevButton = document.createElement("button"),
      nextButton = document.createElement("button")

    prevButton.innerText = 'Prev Slide'
    nextButton.innerText = 'Next Slide'

    this.controls.appendChild(prevButton)
    this.controls.appendChild(nextButton)

    this.controls.addEventListener('pointerdown', () => this.pause())
    this.playPause.addEventListener('pointerdown', () => { 
      if (this.playPause.classList.contains('pause'))
        this.pause()

      if (this.playPause.classList.contains('play'))
        this.continue()
    })

    this.playPause.addEventListener('pointerup', () => {
      if (this.playPause.classList.contains('pause'))
        return

      if (this.playPause.classList.contains('play'))
        return
    })

    document.addEventListener('pointerup', () => this.continue())

    document.addEventListener('touchend', () => this.continue())
    prevButton.addEventListener("pointerup", () => this.prev())
    nextButton.addEventListener('pointerup', () => this.next())
  }

  private addThumbItems() {
    const thumbContainer = document.getElementById('slide-thumb')

    if (thumbContainer) {
      for (let i = 0; i < this.elements.length; i++) {
        thumbContainer.innerHTML +=
          `
          <span>
            <span class='thumb-item'></span>
          </span>
          `
      }
      this.thumbItems = Array.from(document.querySelectorAll('.thumb-item'))

    }
  }

  private init() {
    this.addControl()
    this.addThumbItems()
    this.show(this.index)
  }
}
