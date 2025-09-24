import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table, TableRow, TableCell, TableHead, TableBody, Switch, TableFooter, FormControlLabel,Tooltip, Checkbox,IconButton
} from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import LinkIcon from '@mui/icons-material/Link';
import DeleteIcon from '@mui/icons-material/Delete';
import { useCatch, useEffectAsync } from '../reactHelper';
import { formatBoolean, formatTime } from '../common/util/formatter';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import SettingsMenu from './components/SettingsMenu';
import CollectionFab from './components/CollectionFab';
import CollectionActions from './components/CollectionActions';
import TableShimmer from '../common/components/TableShimmer';
import { useManager } from '../common/util/permissions';
import SearchHeader, { filterByKeyword } from './components/SearchHeader';
import useSettingsStyles from './common/useSettingsStyles';
import fetchOrThrow from '../common/util/fetchOrThrow';
import RemoveDialog from '../common/components/RemoveDialog';

const UsersPage = () => {
  const { classes } = useSettingsStyles();
  const navigate = useNavigate();
  const t = useTranslation();

  const manager = useManager();

  const [timestamp, setTimestamp] = useState(Date.now());
  const [items, setItems] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [temporary, setTemporary] = useState(false);
  const [selectedUser, setSelectedUser] = useState([]);
  const [removing, setRemoving] = useState(false);

  const handleLogin = useCatch(async (userId) => {
    await fetchOrThrow(`/api/session/${userId}`);
    window.location.replace('/');
  });

  const actionLogin = {
    key: 'login',
    title: t('loginLogin'),
    icon: <LoginIcon fontSize="small" />,
    handler: handleLogin,
  };

  const actionConnections = {
    key: 'connections',
    title: t('sharedConnections'),
    icon: <LinkIcon fontSize="small" />,
    handler: (userId) => navigate(`/settings/user/${userId}/connections`),
  };

  useEffectAsync(async () => {
    setLoading(true);
    try {
      const response = await fetchOrThrow('/api/users?excludeAttributes=true');
      setItems(await response.json());
    } finally {
      setLoading(false);
    }
  }, [timestamp]);
   
    const toggleUser = (userId) => {
        setSelectedUser((prev) =>
        prev.includes(userId)
        ? prev.filter((u) => u !== userId)
        : [...prev, userId]
      );
    };
       
    const handleRemove = () => {
    if (selectedUser.length > 0) {
      setRemoving(true);
      }
    };

      const handleRemoveResult = useCatch(async (confirmed) => {
      if (confirmed) {
        for (const id of selectedUser) {
          await fetchOrThrow(`/api/users/${id}`, { method: 'DELETE' });
        }
        setTimestamp(Date.now());
        setSelectedUser([]);
      }
      setRemoving(false);
    });

  return (<>
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['settingsTitle', 'settingsUsers']}>
      <SearchHeader keyword={searchKeyword} setKeyword={setSearchKeyword} />
      <Table className={classes.table}>
        <TableHead>
          <TableRow>
            <TableCell>
             <Tooltip title={t('sharedRemove')}>
              <span>
              <IconButton size="small" onClick={handleRemove} disabled={selectedUser.length === 0} sx={{marginLeft: -1 }} >
              <DeleteIcon fontSize="small" />
              </IconButton>
              </span>
              </Tooltip>
              </TableCell>
            <TableCell>{t('sharedName')}</TableCell>
            <TableCell>{t('userEmail')}</TableCell>
            <TableCell>{t('userAdmin')}</TableCell>
            <TableCell>{t('sharedDisabled')}</TableCell>
            <TableCell>{t('userExpirationTime')}</TableCell>
            <TableCell className={classes.columnAction} />
          </TableRow>
        </TableHead>
        <TableBody>
          {!loading ? items.filter((u) => temporary || !u.temporary).filter(filterByKeyword(searchKeyword)).map((item) => (
            <TableRow key={item.id}>
              <TableCell padding="checkbox">
              <Checkbox size="small" checked={selectedUser.includes(item.id)} onChange={() => toggleUser(item.id)} />
              </TableCell>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.email}</TableCell>
              <TableCell>{formatBoolean(item.administrator, t)}</TableCell>
              <TableCell>{formatBoolean(item.disabled, t)}</TableCell>
              <TableCell>{formatTime(item.expirationTime, 'date')}</TableCell>
              <TableCell className={classes.columnAction} padding="none">
                <CollectionActions
                  itemId={item.id}
                  editPath="/settings/user"
                  endpoint="users"
                  setTimestamp={setTimestamp}
                  customActions={manager ? [actionLogin, actionConnections] : [actionConnections]}
                />
              </TableCell>
            </TableRow>
          )) : (<TableShimmer columns={7} endAction />)}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={7} align="right">
              <FormControlLabel
                control={(
                  <Switch
                    value={temporary}
                    onChange={(e) => setTemporary(e.target.checked)}
                    size="small"
                  />
                )}
                label={t('userTemporary')}
                labelPlacement="start"
              />
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
      <CollectionFab editPath="/settings/user" />
    </PageLayout>
      <RemoveDialog
      open={removing}
      endpoint="users"
      itemIds={selectedUser.length > 1 ? selectedUser : []}
      onResult={handleRemoveResult}
      />
    </>
  );
};

export default UsersPage;
