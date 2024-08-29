import React, { useState, useEffect, useRef } from 'react';
import { marked } from 'marked';
import './home.css';
import Modal from './Model';
import logo from './assets/logo.png';

function Home({ username }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [cloudOpsItems, setCloudOpsItems] = useState([]);
    const [selectedResourceGroup, setSelectedResourceGroup] = useState('');
    const [resources, setResources] = useState([]);
    const [selectedResource, setSelectedResource] = useState('');
    const [insights, setInsights] = useState('');
    const [sessionId, setSessionId] = useState('');
    const [chatMessages, setChatMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [resourceGroupDetails, setResourceGroupDetails] = useState({});
    const [userMessage, setUserMessage] = useState('');
    const messageEndRef = useRef(null);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    // Function to fetch Cloud Ops items
    const fetchCloudOpsItems = async () => {
        try {
            const response = await fetch('https://azuresmartsaverapi.azurewebsites.net/api/Main/GetAllCloudOnboardingDetails');
            const data = await response.json();
            setCloudOpsItems(data);
        } catch (error) {
            console.error("Failed to fetch cloud ops items", error);
        }
    };

    useEffect(() => {
        fetchCloudOpsItems();
    }, []);

    const handleResourceGroupClick = async (resourceGroup) => {
        setSelectedResourceGroup(resourceGroup.resourceGroup);
        setChatMessages([]); // Reset chat messages

        setResourceGroupDetails({
            tenantID: resourceGroup.tenantID,
            clientID: resourceGroup.clientID,
            clientSecret: resourceGroup.clientSecret,
            subscriptionID: resourceGroup.subscriptionID,
            resourceGroup: resourceGroup.resourceGroup
        });

        const requestData = {
            tenantID: resourceGroup.tenantID,
            clientID: resourceGroup.clientID,
            clientSecret: resourceGroup.clientSecret,
            subscriptionID: resourceGroup.subscriptionID,
            resourceGroup: resourceGroup.resourceGroup,
            resourceID: "",
            resourceName: "",
            sessionId: "",
            chatMessage: ""
        };

        try {
            const response = await fetch('https://azuresmartsaverapi.azurewebsites.net/api/Main/ListAllResources', {
                method: 'POST',
                headers: {
                    'accept': '*/*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });

            if (!response.ok) {
                console.error("Server responded with status:", response.status);
                setResources([]);
                return;
            }

            const data = await response.json();
            if (data && Array.isArray(data)) {
                const filteredResources = data.filter(resource =>
                    resource.resourceType === "Microsoft.Web/sites" ||
                    resource.resourceType === "Microsoft.Sql/servers/databases" ||
                    resource.resourceType === "Microsoft.Compute/virtualMachines" ||
                    resource.resourceType === "Microsoft.Kusto/clusters"
                );
                setResources(filteredResources);
            } else {
                console.error("Unexpected API response format:", data);
                setResources([]);
            }
        } catch (error) {
            console.error("Failed to fetch resources:", error.message);
            setResources([]);
        }
    };

    const handleResourceSelection = async (e) => {
        const selectedResourceId = e.target.value;
        setSelectedResource(selectedResourceId);
        setChatMessages([]); // Reset chat messages
        const newSessionId = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        setSessionId(newSessionId);
        setIsLoading(true);

        try {
            let apiEndpoint = '';
            const selectedResourceObj = resources.find(resource => resource.id === selectedResourceId);

            const { tenantID, clientID, clientSecret, subscriptionID, resourceGroup } = resourceGroupDetails;

            if (!tenantID || !clientID || !clientSecret || !subscriptionID || !resourceGroup) {
                throw new Error('Missing required fields');
            }

            switch (selectedResourceObj.resourceType) {
                case "Microsoft.Web/sites":
                    apiEndpoint = 'https://azuresmartsaverapi.azurewebsites.net/api/AppService/AppService_Recommendations';
                    break;
                case "Microsoft.Sql/servers/databases":
                    apiEndpoint = 'https://azuresmartsaverapi.azurewebsites.net/api/AzureSql/AzureSQL_Recommendations';
                    break;
                case "Microsoft.Compute/virtualMachines":
                    apiEndpoint = 'https://azuresmartsaverapi.azurewebsites.net/api/VirtualMachine/VM_Recommendations';
                    break;
                case "Microsoft.Kusto/clusters":
                    apiEndpoint = 'https://azuresmartsaverapi.azurewebsites.net/api/ADX/Cluster_Recommendations';
                    break;
                default:
                    console.error('Unsupported resource type:', selectedResourceObj.resourceType);
                    setIsLoading(false);
                    return;
            }

            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': '*/*'
                },
                body: JSON.stringify({
                    tenantID: tenantID,
                    clientID: clientID,
                    clientSecret: clientSecret,
                    subscriptionID: subscriptionID,
                    resourceGroup: resourceGroup,
                    resourceID: selectedResourceId,
                    resourceName: selectedResourceObj.name,
                    sessionId: newSessionId,
                    chatMessage: ""
                })
            });

            const rawResponse = await response.text();
            console.log("Raw Response:", rawResponse);

            let recommendation;
            try {
                const htmlContent = marked(rawResponse);  // Convert markdown to HTML
                recommendation = <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
            } catch (jsonError) {
                console.warn("Failed to parse response:", jsonError);
                recommendation = <div>{rawResponse}</div>;
            }

            setChatMessages([...chatMessages, { role: "AI", content: recommendation }]);
        } catch (error) {
            console.error("Error:", error);
            setChatMessages([...chatMessages, { role: "Error", content: error.message }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();

        if (userMessage.trim()) {
            setChatMessages([...chatMessages, { role: "User", content: userMessage }]);

            let apiEndpoint = '';
            const selectedResourceObj = resources.find(resource => resource.id === selectedResource);
            switch (selectedResourceObj.resourceType) {
                case "Microsoft.Web/sites":
                    apiEndpoint = 'https://azuresmartsaverapi.azurewebsites.net/api/AppService/AppService_Recommendations';
                    break;
                case "Microsoft.Sql/servers/databases":
                    apiEndpoint = 'https://azuresmartsaverapi.azurewebsites.net/api/AzureSql/AzureSQL_Recommendations';
                    break;
                case "Microsoft.Compute/virtualMachines":
                    apiEndpoint = 'https://azuresmartsaverapi.azurewebsites.net/api/VirtualMachine/VM_Recommendations';
                    break;
                case "Microsoft.Kusto/clusters":
                    apiEndpoint = 'https://azuresmartsaverapi.azurewebsites.net/api/ADX/Cluster_Recommendations';
                    break;
                default:
                    console.error('Unsupported resource type:', selectedResourceObj.resourceType);
                    return;
            }

            const { tenantID, clientID, clientSecret, subscriptionID, resourceGroup } = resourceGroupDetails;

            try {
                const response = await fetch(apiEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': '*/*'
                    },
                    body: JSON.stringify({
                        tenantID: tenantID,
                        clientID: clientID,
                        clientSecret: clientSecret,
                        subscriptionID: subscriptionID,
                        resourceGroup: resourceGroup,
                        resourceID: selectedResource,
                        resourceName: selectedResourceObj.name,
                        sessionId: sessionId,
                        chatMessage: userMessage
                    })
                });

                const rawResponse = await response.text();
                let recommendation;
                try {
                    const htmlContent = marked(rawResponse);  // Convert markdown to HTML
                    recommendation = <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
                } catch (jsonError) {
                    console.warn("Failed to parse JSON, displaying as plain text:", jsonError);
                    recommendation = <div dangerouslySetInnerHTML={{ __html: rawResponse }} />;
                }

                setChatMessages([...chatMessages, { role: "User", content: userMessage }, { role: "AI", content: recommendation }]);
                setUserMessage('');  // Clear the input box after sending the message
            } catch (error) {
                console.error("Error:", error);
                setChatMessages([...chatMessages, { role: "Error", content: error.message }]);
            }
        }
    };

    // Auto-scroll to the bottom whenever a new message is added
    useEffect(() => {
        if (messageEndRef.current) {
            messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatMessages]);

    return (
        <div className="home-container">
            <header className="home-header">
                <div className="header-logo">
                    <img src={logo} alt="Logo" />
                </div>
                <div className="header-title">
                    Cloud Resource Details
                </div>
                <div className="header-user">
                    {username}
                </div>
            </header>
            <div className="home-body">
                <nav className="left-pane">
                    <div className="menu-item">
                        <div className="menu-title">Cloud Ops</div>
                        <ul>
                            {cloudOpsItems.map(item => (
                                <li key={item.id} onClick={() => handleResourceGroupClick(item)}>
                                    <span>{item.resourceGroup}</span>
                                </li>
                            ))}
                        </ul>
                        <button className="add-button" onClick={openModal}>+</button>
                    </div>
                </nav>
                <main className="main-content">
                    <div className="insights-container">
                        <h2>Optimization Insights</h2>
                        <select onChange={handleResourceSelection} value={selectedResource}>
                            <option value="">Select Resources</option>
                            {resources.map((resource, index) => (
                                <option key={index} value={resource.id}>
                                    {resource.name}
                                </option>
                            ))}
                        </select>
                        <div className="chat-window">
                            {isLoading ? (
                                <div>Loading...</div>
                            ) : (
                                chatMessages.map((message, index) => (
                                    <div
                                        key={index}
                                        className={`chat-message ${message.role === "User" ? "user-message" : message.role === "AI" ? "ai-message" : "error-message"}`}>
                                        {message.content}
                                    </div>
                                ))
                            )}
                            <div ref={messageEndRef} />  {/* Empty div for scrolling */}
                        </div>
                        <form className="chat-input-container" onSubmit={handleSendMessage}>
                            <input
                                type="text"
                                placeholder="Message Azure OptimizerAI..."
                                className="chat-input"
                                value={userMessage}
                                onChange={(e) => setUserMessage(e.target.value)}  // Capture user input
                            />
                            <button type="submit" className="chat-send-button">Send</button>
                        </form>
                    </div>
                </main>
            </div>

            <Modal isOpen={isModalOpen} onClose={closeModal} fetchCloudOpsItems={fetchCloudOpsItems}>
                <h2>Cloud Onboarding</h2>
                <form onSubmit={async (e) => {
                    e.preventDefault();
                    // Call the API to save cloud onboarding details here
                    const formData = new FormData(e.target);
                    const requestData = {
                        id: 0,
                        tenantID: formData.get('tenantId'),
                        clientID: formData.get('clientId'),
                        clientSecret: formData.get('clientSecret'),
                        subscriptionID: formData.get('subscriptionId'),
                        resourceGroup: formData.get('resourceGroup'),
                    };

                    try {
                        const response = await fetch('https://azuresmartsaverapi.azurewebsites.net/api/Main/SaveCloudOnboardingDetails', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept': '*/*'
                            },
                            body: JSON.stringify(requestData)
                        });

                        if (response.ok) {
                            console.log("Cloud onboarding details saved successfully.");
                            closeModal();  // Close the modal
                            fetchCloudOpsItems();  // Refresh the cloud ops items
                        } else {
                            console.error("Failed to save cloud onboarding details:", response.status);
                        }
                    } catch (error) {
                        console.error("Error:", error);
                    }
                }}>
                    <label>Tenant ID</label>
                    <input type="text" name="tenantId" required />
                    <label>Client ID</label>
                    <input type="text" name="clientId" required />
                    <label>Client Secret</label>
                    <input type="password" name="clientSecret" required />
                    <label>Subscription ID</label>
                    <input type="text" name="subscriptionId" required />
                    <label>Resource Group</label>
                    <input type="text" name="resourceGroup" required />
                    <button type="submit" className="submit-button">Fetch Resources</button>
                </form>
            </Modal>
        </div>
    );
}

export default Home;
