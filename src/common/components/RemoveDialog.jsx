import Button from '@mui/material/Button';
import { Snackbar } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useTranslation } from './LocalizationProvider';
import { useCatch } from '../../reactHelper';
import { snackBarDurationLongMs } from '../util/duration';
import fetchOrThrow from '../util/fetchOrThrow';

const useStyles = makeStyles()((theme) => ({
  root: {
    [theme.breakpoints.down('md')]: {
      bottom: `calc(${theme.dimensions.bottomBarHeight}px + ${theme.spacing(1)})`,
    },
  },
  button: {
    height: 'auto',
    marginTop: 0,
    marginBottom: 0,
  },
}));

const RemoveDialog = ({
  open, endpoint, itemId, itemIds = [], onResult,
}) => {
  const { classes } = useStyles();
  const t = useTranslation();

  // const handleRemove = useCatch(async () => {
  //   await fetchOrThrow(`/api/${endpoint}/${itemId}`, { method: 'DELETE' });
  //   onResult(true);
  // });

  const handleRemove = useCatch(async () => {
    if (itemIds.length > 0) {
      for (const id of itemIds) {
        await fetchOrThrow(`/api/${endpoint}/${id}`, { method: 'DELETE' });
      }
    } else if (itemId) {
      await fetchOrThrow(`/api/${endpoint}/${itemId}`, { method: 'DELETE' });
    }
    onResult(true);
  });

  return (
    <Snackbar
      className={classes.root}
      open={open}
      autoHideDuration={snackBarDurationLongMs}
      onClose={() => onResult(false)}
      message={t('sharedRemoveConfirm')}
      action={(
        <Button size="small" className={classes.button} color="error" onClick={handleRemove}>
          {t('sharedRemove')}
        </Button>
      )}
    />
  );
};

export default RemoveDialog;
