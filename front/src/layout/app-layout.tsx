import React from 'react';
import { AppbarComponent, FooterComponent } from 'common-app';

export const AppLayout: React.FC = props => {
  const [showLinks, setShowLinks] = React.useState<boolean>(true);
  return (
    <>
      <AppbarComponent showLinks={showLinks} />
      {props.children}
      <FooterComponent showLinks={showLinks} />
    </>
  );
};
