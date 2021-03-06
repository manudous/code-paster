import * as React from 'react';
import * as classes from './trainer.styles';
import { HeaderComponent } from './components/header.component';
import { NewTextComponent } from './components/new-text.component';
import { SessionComponent } from './components/session.component';

interface Props {
  handleAppendTrainerText: (trainerText: string) => void;
  handleSendFullContentLog: (fullContent: string) => void;
  currentTrainerUrl: string;
  currentStudentUrl: string;
  log: string;
}

export const TrainerComponent: React.FC<Props> = props => {
  const {
    handleAppendTrainerText,
    handleSendFullContentLog,
    currentTrainerUrl,
    currentStudentUrl,
    log,
  } = props;

  const { mainContainer, content, backgroundContainer } = classes;

  return (
    <>
      <main className={mainContainer}>
        <div className={backgroundContainer}>
          <div className={content}>
            <HeaderComponent
              currentTrainerUrl={currentTrainerUrl}
              currentStudentUrl={currentStudentUrl}
            />
          </div>
        </div>
        <div className={backgroundContainer}>
          <div className={content}>
            <NewTextComponent
              handleAppendTrainerText={handleAppendTrainerText}
            />
          </div>
        </div>
        <div className={content}>
          <SessionComponent
            log={log}
            handleSendFullContentLog={handleSendFullContentLog}
          />
        </div>
      </main>
    </>
  );
};
