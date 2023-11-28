import { useCallback, useEffect, useState } from 'react';
import { Chip, Text } from 'react-native-paper';
import {
  attachableWebsocketListener,
  genericAttachableWebsocketListener,
} from '../CommunicationPipelines/websocket/attachableWebsocketListener';
import { WebsocketPipeline } from '../CommunicationPipelines/websocket';
import { getStyles } from '../utils';

function parsePGTField(data: any, fieldName: string, setter: CallableFunction) {
  if (data[fieldName] !== undefined) {
    setter(data[fieldName]);
  }
}

export const GameStatusCard = () => {
  const [pid, setPid] = useState(0);
  const [playerName, setPlayerName] = useState('');
  const [playerHealth, setPlayerHealth] = useState(0);
  const [playerPoints, setPlayerPoints] = useState(0);
  const [playerColorRed, setPlayerColorRed] = useState(0);
  const [playerColorGreen, setPlayerColorGreen] = useState(0);
  const [playerColorBlue, setPlayerColorBlue] = useState(0);
  const [playerColorBeforeGame, setPlayerColorBeforeGame] = useState(false);
  const [playerAmmoLimit, setPlayerAmmoLimit] = useState(false);
  const [playerAmmo, setPlayerAmmo] = useState(0);
  const [phaserEnable, setPhaserEnable] = useState(false);
  const [phaserDisableUntil, setPhaserDisableUntil] = useState(0);
  const [maxShotInterval, setMaxShotInterval] = useState(0);
  const [playerRank, setPlayerRank] = useState(0);
  const [playerInviolable, setPlayerInviolable] = useState(false);
  const [playerInviolableUntil, setPlayerInviolableUntil] = useState(0);
  const [playerInviolableLightsOff, setPlayerInviolableLightsOff] =
    useState(false);

  const [gid, setGid] = useState('');
  const [gamePlayerCount, setGamePlayerCount] = useState(0);
  const [gameTeamCount, setGameTeamCount] = useState(0);
  const [gameStartTime, setGameStartTime] = useState(0);
  const [gameCreatedAt, setGameCreatedAt] = useState(0);
  const [gameCreatedBy, setGameCreatedBy] = useState('');

  // create useEffect to set these values
  const [isLightOn, setLightOn] = useState(true);
  const [isPhaserEnabled, setIsPhaserEnabled] = useState(true);
  const [isGameRunning, setGameRunning] = useState(true);
  const [gameCountdown, setGameCountdown] = useState(NaN);
  const [isPlayerInviolable, setIsPlayerInviolable] = useState(false);

  const gameStatusListenerCallback = useCallback((e: string) => {
    try {
      let data = JSON.parse(e);

      parsePGTField(data, 'p_id', setPid);
      parsePGTField(data, 'p_n', setPlayerName);
      parsePGTField(data, 'p_h', setPlayerHealth);
      parsePGTField(data, 'p_p', setPlayerPoints);
      parsePGTField(data, 'p_cr', setPlayerColorRed);
      parsePGTField(data, 'p_cg', setPlayerColorGreen);
      parsePGTField(data, 'p_cb', setPlayerColorBlue);
      parsePGTField(data, 'p_cbg', setPlayerColorBeforeGame);
      parsePGTField(data, 'p_al', setPlayerAmmoLimit);
      parsePGTField(data, 'p_a', setPlayerAmmo);
      parsePGTField(data, 'p_pe', setPhaserEnable);
      parsePGTField(data, 'p_pdu', setPhaserDisableUntil);
      parsePGTField(data, 'p_msi', setMaxShotInterval);
      parsePGTField(data, 'p_r', setPlayerRank);
      parsePGTField(data, 'p_i', setPlayerInviolable);
      parsePGTField(data, 'p_iu', setPlayerInviolableUntil);
      parsePGTField(data, 'p_ilo', setPlayerInviolableLightsOff);
      parsePGTField(data, 'g_id', setGid);
      parsePGTField(data, 'g_pc', setGamePlayerCount);
      parsePGTField(data, 'g_tc', setGameTeamCount);
      parsePGTField(data, 'g_st', setGameStartTime);
      parsePGTField(data, 'g_ca', setGameCreatedAt);
      parsePGTField(data, 'g_cb', setGameCreatedBy);
    } catch (error) {}
  }, []);
  const gameStatusListener: attachableWebsocketListener =
    new genericAttachableWebsocketListener(gameStatusListenerCallback);

  useEffect(() => {
    WebsocketPipeline.Instance.attachMessagingListener(gameStatusListener);
  }, []);

  return (
    <>
      {!!gid ? (
        <>
          <Chip icon="check-bold" style={getStyles().mTLR10}>
            {gid}
          </Chip>
          <Chip icon="star-four-points" style={getStyles().mTLR10}>
            {playerPoints}
          </Chip>
          <Chip icon="bottle-tonic-plus" style={getStyles().mTLR10}>
            {playerHealth}
          </Chip>
        </>
      ) : (
        <>
          <Chip icon="message-alert" style={getStyles().mTLR10}>
            Join a Game!
          </Chip>
        </>
      )}
    </>
  );
};
