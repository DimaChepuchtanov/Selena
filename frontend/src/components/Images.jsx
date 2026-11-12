import { useEffect, useState } from 'react';
import { DEFAULT_IMAGE, safeImageUrl } from '../utils/format';

export function ProductImage({ src, alt = '', ...props }) {
  const [url, setUrl] = useState(() => safeImageUrl(src));
  useEffect(() => setUrl(safeImageUrl(src)), [src]);
  return <img {...props} src={url} alt={alt} loading="lazy" onError={() => { if (url !== DEFAULT_IMAGE) setUrl(DEFAULT_IMAGE); }} />;
}
