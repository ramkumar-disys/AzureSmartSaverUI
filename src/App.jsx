import React, { useState } from 'react';
import './App.css';
import { marked } from 'marked';

function App() {
    const [activeTab, setActiveTab] = useState('onboarding');
    const [tenantId, setTenantId] = useState('');
    const [clientId, setClientId] = useState('');
    const [clientSecret, setClientSecret] = useState('');
    const [subscriptionId, setSubscriptionId] = useState('');
    const [resourceGroup, setResourceGroup] = useState('');
    const [resources, setResources] = useState([]);
    const [selectedResource, setSelectedResource] = useState('');
    const [chatMessages, setChatMessages] = useState([]);
    const [userMessage, setUserMessage] = useState('');
    const [sessionId, setSessionId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('https://azuresmartsaverapi.azurewebsites.net/api/Main/ListAllResources', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': '*/*'
                },
                body: JSON.stringify({
                    tenantID: tenantId,
                    clientID: clientId,
                    clientSecret: clientSecret,
                    subscriptionID: subscriptionId,
                    resourceGroup: resourceGroup,
                    resourceID: "",
                    resourceName: "",
                    sessionId: "",
                    chatMessage: ""
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (typeof data === "string") {
                throw new Error("Invalid JSON response");
            }

            // Filter the resources to only include the specified types
            const filteredResources = data.filter(resource =>
                resource.resourceType === "Microsoft.Web/sites" ||
                resource.resourceType === "Microsoft.Sql/servers/databases" ||
                resource.resourceType === "Microsoft.Compute/virtualMachines" ||
                resource.resourceType === "Microsoft.Kusto/clusters"
            );

            setResources(filteredResources);
            setActiveTab('insights');
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const handleResourceSelection = async (e) => {
        const selectedResourceId = e.target.value;
        setSelectedResource(selectedResourceId);
        const newSessionId = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        setSessionId(newSessionId);
        setIsLoading(true);

        try {
            let apiEndpoint = '';
            const selectedResourceObj = resources.find(resource => resource.id === selectedResourceId);
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
                    tenantID: tenantId,
                    clientID: clientId,
                    clientSecret: clientSecret,
                    subscriptionID: subscriptionId,
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
                recommendation = marked.parse(rawResponse);
            } catch (jsonError) {
                console.warn("Failed to parse JSON, displaying as plain text:", jsonError);
                recommendation = rawResponse;
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

            try {
                const response = await fetch(apiEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': '*/*'
                    },
                    body: JSON.stringify({
                        tenantID: tenantId,
                        clientID: clientId,
                        clientSecret: clientSecret,
                        subscriptionID: subscriptionId,
                        resourceGroup: resourceGroup,
                        resourceID: selectedResource,
                        resourceName: "",
                        sessionId: sessionId,
                        chatMessage: userMessage
                    })
                });

                const rawResponse = await response.text();
                let recommendation;
                try {
                    recommendation = marked.parse(rawResponse);
                } catch (jsonError) {
                    console.warn("Failed to parse JSON, displaying as plain text:", jsonError);
                    recommendation = rawResponse;
                }

                setChatMessages([...chatMessages, { role: "User", content: userMessage }, { role: "AI", content: recommendation }]);
                setUserMessage('');
            } catch (error) {
                console.error("Error:", error);
                setChatMessages([...chatMessages, { role: "Error", content: error.message }]);
            }
        }
    };

    return (
        <div className="App">
            {/*<div className="tabs">*/}
            {/*    <button onClick={() => setActiveTab('onboarding')} className={activeTab === 'onboarding' ? 'active' : ''}>Cloud Onboarding</button>*/}
            {/*    <button onClick={() => setActiveTab('insights')} className={activeTab === 'insights' ? 'active' : ''}>Optimization Insights</button>*/}
            {/*</div>*/}

            {activeTab === 'onboarding' && (
                <div className="form-container">
                    <h2>Cloud Onboarding</h2>
                    <form onSubmit={handleSubmit}>
                        <label>Tenant ID</label>
                        <input type="text" value={tenantId} onChange={(e) => setTenantId(e.target.value)} />
                        <label>Client ID</label>
                        <input type="text" value={clientId} onChange={(e) => setClientId(e.target.value)} />
                        <label>Client Secret</label>
                        <input type="text" value={clientSecret} onChange={(e) => setClientSecret(e.target.value)} />
                        <label>Subscription ID</label>
                        <input type="text" value={subscriptionId} onChange={(e) => setSubscriptionId(e.target.value)} />
                        <label>Resource Group</label>
                        <input type="text" value={resourceGroup} onChange={(e) => setResourceGroup(e.target.value)} />
                        <button type="submit">Fetch Resources</button>
                    </form>
                </div>
            )}

            {activeTab === 'insights' && (
                <div className="insights-container">
                    <h2>Optimization Insights</h2>
                    <label>Resource</label>
                    <select value={selectedResource} onChange={handleResourceSelection}>
                        <option value="">Select a Resource</option>
                        {resources.length > 0 ? (
                            resources.map((resource, index) => (
                                <option key={resource.id || index} value={resource.id}>
                                    {resource.name || "Unnamed Resource"}
                                </option>
                            ))
                        ) : (
                            <option disabled>No Resources Available</option>
                        )}
                    </select>

                    <h3>Chat</h3>

                    {isLoading ? (
                        <div className="spinner"></div>
                    ) : (
                        <div className="chat-window">
                            {chatMessages.map((message, index) => (
                                <div
                                    key={index}
                                    className={`chat-message ${message.role.toLowerCase()}`}
                                    dangerouslySetInnerHTML={{ __html: message.content }}
                                />
                            ))}
                        </div>
                    )}

                    <form className="chat-input-container" onSubmit={handleSendMessage}>
                        <input
                            type="text"
                            value={userMessage}
                            onChange={(e) => setUserMessage(e.target.value)}
                            placeholder="Message Azure OptimizerAI..."
                            className="chat-input"
                        />
                        <button type="submit" className="chat-send-button">Send</button>
                    </form>
                </div>
            )}

            <div className="note">
                <strong>Note:</strong> This preview currently supports SQLDB, Azure App Service, Azure Data Explorer, and Azure VM.
            </div>
        </div>
    );
}

export default App;
