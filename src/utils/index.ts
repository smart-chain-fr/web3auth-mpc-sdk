export default function createElementFromString(
  htmlString: string,
  parentElement: HTMLElement | ShadowRoot | null = null
): HTMLElement {
  const div = document.createElement("div");
  div.innerHTML = htmlString.trim();
  const child = div.firstElementChild;
  if (parentElement && child) parentElement.appendChild(child);
  return child as HTMLElement;
}
