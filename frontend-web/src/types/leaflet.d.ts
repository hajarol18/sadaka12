declare module 'leaflet' {
  export type PointExpression = [number, number];
  export type LatLngExpression = [number, number];

  export interface FitBoundsOptions {
    padding?: PointExpression | number;
    maxZoom?: number;
  }

  export interface MapOptions {
    center?: LatLngExpression;
    zoom?: number;
    minZoom?: number;
    maxZoom?: number;
    scrollWheelZoom?: boolean;
  }

  export interface TileLayerOptions {
    attribution?: string;
    maxZoom?: number;
    minZoom?: number;
    opacity?: number;
    url?: string;
  }

  export interface MarkerOptions {
    icon?: Icon | DivIcon;
  }

  export interface IconOptions {
    iconUrl?: string;
    iconRetinaUrl?: string;
    shadowUrl?: string;
    iconSize?: PointExpression;
    iconAnchor?: PointExpression;
    popupAnchor?: PointExpression;
    shadowSize?: PointExpression;
  }

  export interface DivIconOptions {
    className?: string;
    html?: string;
    iconSize?: PointExpression;
    iconAnchor?: PointExpression;
    popupAnchor?: PointExpression;
  }

  export class LatLng {
    constructor(lat: number, lng: number);
    lat: number;
    lng: number;
  }

  export class LatLngBounds {
    constructor(latlngs: LatLng[]);
    extend(latlng: LatLng): this;
  }

  export class Icon<T extends IconOptions = IconOptions> {
    constructor(options?: T);
  }

  export class DivIcon<T extends DivIconOptions = DivIconOptions> {
    constructor(options?: T);
  }

  export class Map {
    setView(center: LatLngExpression, zoom: number): this;
    fitBounds(bounds: LatLngBounds, options?: FitBoundsOptions): this;
  }

  export class TileLayer {}
  export class Marker<T = any> {}
  export class Popup {
    setContent(content: string | HTMLElement): this;
    getContent(): string | HTMLElement | undefined;
  }

  export function latLng(lat: number, lng: number): LatLng;
  export function latLngBounds(latlngs: LatLng[]): LatLngBounds;
  export function divIcon(options?: DivIconOptions): DivIcon;

  const L: {
    Icon: typeof Icon;
    DivIcon: typeof DivIcon;
    latLng: typeof latLng;
    latLngBounds: typeof latLngBounds;
    divIcon: typeof divIcon;
  };

  export default L;
}