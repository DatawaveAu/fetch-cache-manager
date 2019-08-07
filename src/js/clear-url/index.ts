export default function clearUrl(url: string): string {
    return url.includes('?') ? url.substring(0, url.indexOf('?')) : url;
}
