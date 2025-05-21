export const YOUTUBE_REGEX = /^(?:(?:https?:)?\/\/)?(?:www\.)?(?:m\.)?(?:youtu(?:be)?\.com\/(?:v\/|embed\/|watch(?:\/|\?v=))|youtu\.be\/)((?:\w|-){11})(?:\S+)?$/;

export const MISSING_THUMBNAIL_URL = "https://t3.ftcdn.net/jpg/02/36/99/22/360_F_236992283_sNOxCVQeFLd5pdqaKGh8DRGMZy7P4XKm.jpg";

export function isValidYoutubeURL(url: string){
    const res = url.match(YOUTUBE_REGEX);
    return res? true: false;
}

export function getYoutubeVideoId(url: string){
    const res = url.match(YOUTUBE_REGEX);
    if (res) {
        return res[1];
    }
    return "NOT VALID URL";
}