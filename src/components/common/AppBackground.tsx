import React, { useState, useEffect } from 'react';
import { readTheme } from '../../services/ThemeService';

export const AppBackground: React.FC = () => {
  const [theme, setTheme] = useState(readTheme);
  const [mobile, setMobile] = useState(() => window.matchMedia('(max-width: 767px)').matches);
  const [imageFailed, setImageFailed] = useState(false);

  // Một nền chung cho mọi vai trò và mọi màn hình.
  // journey* là trường chuẩn mới; các trường cover/role chỉ còn làm dự phòng cho dữ liệu cũ.
  const customSource = mobile
    ? theme.journeyMobile ||
      theme.journeyDesktop ||
      theme.coverMobile ||
      theme.coverDesktop ||
      theme.roleMobile ||
      theme.roleDesktop
    : theme.journeyDesktop ||
      theme.journeyMobile ||
      theme.coverDesktop ||
      theme.coverMobile ||
      theme.roleDesktop ||
      theme.roleMobile;
  const bundledSource = '/images/chamdanang-journey-orange.webp';
  const source = customSource || bundledSource;
  const [useBundledSource, setUseBundledSource] = useState(false);
  const imageSource = useBundledSource ? bundledSource : source;

  useEffect(() => { setImageFailed(false); setUseBundledSource(false); }, [source]);
  useEffect(() => {
    const refresh = () => setTheme(readTheme());
    const query = window.matchMedia('(max-width: 767px)');
    const resize = () => setMobile(query.matches);
    window.addEventListener('cham-theme-changed', refresh);
    const refreshStorage = () => setTheme(readTheme(true));
    window.addEventListener('storage', refreshStorage);
    query.addEventListener('change', resize);
    return () => {
      window.removeEventListener('cham-theme-changed', refresh);
      window.removeEventListener('storage', refreshStorage);
      query.removeEventListener('change', resize);
    };
  }, []);

  return (
    <div className="adventure-background" aria-hidden="true">
      <div className="adventure-default" />
      {imageSource && !imageFailed && (
        <img
          src={imageSource}
          alt=""
          onError={() => {
            // A stale local/remote preview must not hide the approved background.
            if (imageSource !== bundledSource) setUseBundledSource(true);
            else setImageFailed(true); // Existing illustrated SVG remains visible.
          }}
          className="adventure-custom"
          style={{ filter: 'blur(' + theme.blur + 'px)' }}
        />
      )}
      <div className="adventure-light" style={{ opacity: theme.lightness }} />
    </div>
  );
};
