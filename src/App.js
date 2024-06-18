import React, { useState } from 'react';
import axios from 'axios';
import { Spinner, Card, Button, Form, Container, Row, Col, Image } from 'react-bootstrap';
import './App.css';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('image', selectedFile);

    setLoading(true);
    setResponse('');

    try {
      const res = await axios.post('http://localhost:3001/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setResponse(res.data.response);
    } catch (error) {
      console.error('Error uploading file:', error);
      setResponse('Error uploading file. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="p-3">
      <h1 className="text-center text-primary mb-4">Car Damage Classifier</h1>
      <Row className="justify-content-center">
        <Col md={6}>
          <Form onSubmit={handleSubmit} className="text-center">
            <Form.Group controlId="formFile" className="mb-3">
              <Form.Label>Upload an Image</Form.Label>
              <Form.Control type="file" onChange={handleFileChange} accept="image/*" />
            </Form.Group>
            <Button variant="primary" type="submit" disabled={loading}>
              Upload
            </Button>
          </Form>
          {preview && (
            <div className="mt-3">
              <h5>Image Preview:</h5>
              <Image src={preview} fluid />
            </div>
          )}
          {loading && (
            <div className="mt-3">
              <Spinner animation="border" variant="primary" />
              <p>Assessing damage...</p>
            </div>
          )}
          {response && (
            <Card className="mt-3">
              <Card.Body>
                <Card.Title>Damage Assessment</Card.Title>
                <Card.Text>{response}</Card.Text>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default App;
