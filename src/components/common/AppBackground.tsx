import React, { useState, useEffect } from 'react';
import { readTheme } from '../../services/ThemeService';
import { DEFAULT_APP_BACKGROUND_DATA_URL } from '../../assets/defaultAppBackground';

export const AppBackground: React.FC = () => {
  const [theme, setTheme] = useState(readTheme);
  const [mobile, setMobile] = useState(() => window.matchMedia('(max-width: 767px)').matches);
  const [imageFailed, setImageFailed] = useState(false);

  const customSource = mobile
    ? theme.journeyMobile || theme.journeyDesktop
    : theme.journeyDesktop || theme.journeyMobile;
  const source = customSource || DEFAULT_APP_BACKGROUND_DATA_URL;

  useEffect(() => { setImageFailed(false); }, [source]);
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
      {source && !imageFailed && (
        <img
          src={source}
          alt=""
          onError={() => setImageFailed(true)}
          className="adventure-custom"
          style={{ filter: 'blur(' + theme.blur + 'px)' }}
        />
      )}
      <div className="adventure-light" style={{ opacity: theme.lightness }} />
    </div>
  );
};
