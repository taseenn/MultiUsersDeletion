import React, { useEffect, useState } from 'react';
import fetchOrThrow from '../common/util/fetchOrThrow';
import { Button, TextField, Card, CardContent, Typography, Container, CircularProgress, Alert } from '@mui/material';
import PageLayout from '../common/components/PageLayout';
import SettingsMenu from '../settings/components/SettingsMenu';
import useSettingsStyles from '../settings/common/useSettingsStyles'

const XmlEditor = () => {
  const [xmlContent, setXmlContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

   const { classes } = useSettingsStyles();

  useEffect(() => {
    const fetchXml = async () => {
      try {
        setLoading(true);
        const response = await fetchOrThrow('/api/xml');
        const text = await response.text();
        setXmlContent(text);
      } catch (err) {
        setMessage({ text: 'Error fetching XML', type: 'error' });
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchXml();
  }, []);

    useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ text: '', type: '' }), 3000);
      return () => clearTimeout(timer); 
    }
  }, [message]);

  const saveXml = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/xml', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: xmlContent,
      });
      const text = await response.text();
      setMessage({ text, type: 'success' });
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Error saving XML', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <CircularProgress style={{ margin: 20 }} />;

  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['commandConfiguration', 'settingsTitle']}>
     <Container className={classes.container}>
      <Card style={{width: '80%', margin: 'auto auto', padding: 20, borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          XML Editor
        </Typography>

        <TextField
          label="Edit XML"
          multiline
          fullWidth
          minRows={15}
          maxRows={25}
          value={xmlContent}
          onChange={(e) => setXmlContent(e.target.value)}
          variant="outlined"
          sx={{
            fontFamily: 'monospace',
            backgroundColor: '#f5f5f5',
            marginBottom: 2,
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Button
            variant="contained"
            color="secondary"
            onClick={saveXml}
            disabled={saving}
            style={{ minWidth: 120 }}
          >
            Save
          </Button>
        </div>
        {message.text && (
          <Alert severity={message.type} style={{ marginTop: 15 }}>
            {message.text}
          </Alert>
        )}
      </CardContent>
    </Card>
    </Container>
    </PageLayout>
  );
};

export default XmlEditor;

