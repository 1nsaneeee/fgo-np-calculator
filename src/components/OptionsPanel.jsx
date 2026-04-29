import { ToggleButton, ToggleButtonGroup, Box } from '@mui/material';
import useStore from '@/store/index';

export default function OptionsPanel() {
  const options = useStore((s) => s.options);
  const toggleOption = useStore((s) => s.toggleOption);

  return (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
      <ToggleButtonGroup size="small">
        <ToggleButton
          value="overkill"
          selected={options.overkill}
          onChange={() => toggleOption('overkill')}
        >
          {options.overkill ? '\u2713' : '\u25CB'} 鞭尸
        </ToggleButton>
        <ToggleButton
          value="isCrit"
          selected={options.isCrit}
          onChange={() => toggleOption('isCrit')}
        >
          {options.isCrit ? '\u2713' : '\u25CB'} 暴击
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
}
