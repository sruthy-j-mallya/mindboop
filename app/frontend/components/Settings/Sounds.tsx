import type { UpdateUserPreferencePayload, UserPreference } from "@/apis/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { previewAlarmSound } from "@/utils/alarmSound";
import { ALARM_SOUNDS } from "@/utils/alarmSound/constants";
import type { AlarmSoundId } from "@/utils/alarmSound/types";
import { unlockAudio } from "@/utils/audioContext";
import { playCompletionSound } from "@/utils/completionSound";
import { COMPLETION_SOUNDS, NO_COMPLETION_SOUND } from "@/utils/completionSound/constants";
import type { CompletionSoundId } from "@/utils/completionSound/types";

import SoundSetting from "./SoundSetting";

type SoundsProps = {
  preference: UserPreference;
  onChange: (changes: UpdateUserPreferencePayload) => void;
};

// Picking a sound plays it, so you hear what you chose; Play replays it.
const Sounds = ({ preference: { completionSound, breakAlarmSound }, onChange }: SoundsProps) => {
  const handleCompletionSoundPreview = (id: CompletionSoundId = completionSound) => {
    unlockAudio();
    playCompletionSound(id);
  };

  const handleBreakAlarmSoundPreview = (id: AlarmSoundId = breakAlarmSound) => {
    unlockAudio();
    previewAlarmSound(id);
  };

  const handleCompletionSoundChange = (id: CompletionSoundId) => {
    onChange({ completionSound: id });
    handleCompletionSoundPreview(id);
  };

  const handleBreakAlarmSoundChange = (id: AlarmSoundId) => {
    onChange({ breakAlarmSound: id });
    handleBreakAlarmSoundPreview(id);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sounds</CardTitle>
        <CardDescription>Saved to your account, so they follow you to every device.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <SoundSetting
          description="When you tick off a task or finish a Timer session."
          id="completion-sound"
          isPreviewDisabled={completionSound === NO_COMPLETION_SOUND}
          label="Task completed"
          options={COMPLETION_SOUNDS}
          value={completionSound}
          onChange={handleCompletionSoundChange}
          onPreview={() => handleCompletionSoundPreview()}
        />
        <SoundSetting
          description="Rings for a minute when a break ends."
          id="break-alarm-sound"
          label="Break over"
          options={ALARM_SOUNDS}
          value={breakAlarmSound}
          onChange={handleBreakAlarmSoundChange}
          onPreview={() => handleBreakAlarmSoundPreview()}
        />
      </CardContent>
    </Card>
  );
};

export default Sounds;
