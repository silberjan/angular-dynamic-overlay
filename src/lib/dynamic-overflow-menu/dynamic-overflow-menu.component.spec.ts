import { Overlay, OverlayContainer } from '@angular/cdk/overlay'
import { Component } from '@angular/core'
import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { By } from '@angular/platform-browser'
import { DynamicOverflowMenuModule } from './dynamic-overflow-menu.module'

@Component({
  template: `
    <jcs-dynamic-overflow-menu>
      <ng-template>
        <div class="item" *jcsResponsiveItem="'auto'; breakpoint: 250">1</div>
        <div class="item" *jcsResponsiveItem="'auto'; breakpoint: 300">2</div>
        <div class="item" *jcsResponsiveItem="'auto'; breakpoint: 350">3</div>
        <div class="item" *jcsResponsiveItem="'auto'; breakpoint: 400">4</div>
        <div class="item" *jcsResponsiveItem="'auto'; breakpoint: 500">6</div>
        <div class="item" *jcsResponsiveItem="'auto'; breakpoint: 550">7</div>
        <div class="staticitem" *jcsResponsiveItem="'overlay'">ONLY OVERLAY</div>
        <div class="staticitem" *jcsResponsiveItem="'host'">ONLY HOST</div>
      </ng-template>

      <button jcs-dynamic-overflow-menu-trigger>
        <span>●</span>
        <span>●</span>
        <span>●</span>
      </button>
    </jcs-dynamic-overflow-menu>
  `,
})
class TestComponent {}

function resizeWindow(size: number) {
  Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: size })
  window.dispatchEvent(new Event('resize'))
}

describe('DynamicOverflowMenuComponent', () => {
  let component: TestComponent
  let fixture: ComponentFixture<TestComponent>
  let overlayContainerElement: HTMLElement
  let overlay: Overlay

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TestComponent],
      imports: [DynamicOverflowMenuModule],
      providers: [
        {
          provide: OverlayContainer,
          useFactory: () => {
            overlayContainerElement = document.createElement('div')

            return { getContainerElement: () => overlayContainerElement }
          },
        },
      ],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent)
    component = fixture.componentInstance
    overlay = TestBed.inject(Overlay)

    fixture.detectChanges()
  })

  test('should show all the items in the template', () => {
    window.dispatchEvent(new Event('DOMContentLoaded'))
    fixture.detectChanges()
    const items = fixture.debugElement.queryAll(By.css('.item'))
    expect(items.length).toBe(6)
    const staticitems = fixture.debugElement.queryAll(By.css('.staticitem'))
    expect(staticitems.length).toBe(1)
  })

  test('should hide items based on window width', () => {
    resizeWindow(475)
    fixture.detectChanges()

    const items = fixture.debugElement.queryAll(By.css('.item'))
    expect(items.length).toBe(4)
  })

  test('should show hidden items in overlay based on window width', () => {
    resizeWindow(475)
    fixture.detectChanges()

    const button: HTMLButtonElement = fixture.debugElement.query(By.css('button')).nativeElement
    button.click()
    fixture.detectChanges()

    const items = overlayContainerElement.querySelectorAll('.item')
    expect(items.length).toBe(2)
  })

  test('should close on backdrop click', () => {
    resizeWindow(475)
    fixture.detectChanges()

    const button: HTMLButtonElement = fixture.debugElement.query(By.css('button')).nativeElement
    button.click()
    fixture.detectChanges()

    const backdrop: HTMLElement = overlayContainerElement.querySelector('.cdk-overlay-backdrop')
    backdrop.click()
    fixture.detectChanges()

    expect(overlayContainerElement.querySelector('.item')).toBeFalsy()
  })

  test('Should not open twice ', () => {
    resizeWindow(475)
    fixture.detectChanges()

    const button: HTMLButtonElement = fixture.debugElement.query(By.css('button')).nativeElement
    const overlaySpy = jest.spyOn(overlay, 'create')
    button.click()
    button.click()
    fixture.detectChanges()
    expect(overlaySpy).toHaveBeenCalledTimes(1)
  })
})
