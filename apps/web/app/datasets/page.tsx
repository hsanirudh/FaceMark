"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import {
  Upload,
  Users,
  Database,
  RefreshCw,
  CheckCircle,
  XCircle,
  UserPlus,
  ImageIcon,
  Brain,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import toast from "react-hot-toast";
import { AppNavigation } from "@/components/AppNavigation";

interface DatasetPerson {
  name: string;
  image_count: number;
  has_embedding: boolean;
}

interface DatasetInfo {
  dataset: DatasetPerson[];
  totalPeople: number;
  totalEmbeddings: number;
}

export default function DatasetPage() {
  const { data: session } = useSession();
  const [people, setPeople] = useState<DatasetPerson[]>([]);
  const [personName, setPersonName] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isRecomputing, setIsRecomputing] = useState(false);
  const [datasetInfo, setDatasetInfo] = useState<DatasetInfo | null>(null);

  useEffect(() => {
    if (session) {
      fetchDatasetInfo();
    }
  }, [session]);

  const fetchDatasetInfo = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/dataset");
      if (response.ok) {
        const data = await response.json();
        setDatasetInfo(data);
        setPeople(data.dataset || []);
      }
    } catch (error) {
      console.error("Error fetching dataset:", error);
      toast.error("Failed to load dataset");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
  };

  const handleAddPerson = async () => {
    if (!personName.trim() || selectedFiles.length === 0) {
      toast.error("Please provide a name and select at least one image");
      return;
    }

    setIsAdding(true);
    try {
      const formData = new FormData();
      formData.append("personName", personName.trim());

      selectedFiles.forEach((file) => {
        formData.append("images", file);
      });

      const response = await fetch("/api/dataset/add-person", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(
          `Successfully added ${personName} with ${selectedFiles.length} images`
        );
        setPersonName("");
        setSelectedFiles([]);
        fetchDatasetInfo(); // Refresh the dataset

        // Reset file input
        const fileInput = document.querySelector(
          'input[type="file"]'
        ) as HTMLInputElement;
        if (fileInput) fileInput.value = "";
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to add person");
      }
    } catch (error) {
      console.error("Error adding person:", error);
      toast.error("Failed to add person");
    } finally {
      setIsAdding(false);
    }
  };

  const handleRecomputeEmbeddings = async () => {
    setIsRecomputing(true);
    try {
      const response = await fetch("/api/dataset/recompute", {
        method: "POST",
      });

      if (response.ok) {
        toast.success("Embeddings recomputed successfully!");
        fetchDatasetInfo(); // Refresh the dataset
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to recompute embeddings");
      }
    } catch (error) {
      console.error("Error recomputing embeddings:", error);
      toast.error("Failed to recompute embeddings");
    } finally {
      setIsRecomputing(false);
    }
  };

  if (!session) {
    return (
      <>
        <AppNavigation />
        <div className="min-h-screen flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle>Authentication Required</CardTitle>
              <CardDescription>
                Please sign in to access dataset management
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <AppNavigation />
      <div className="min-h-screen bg-black p-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                Dataset Management
              </h1>
              <p className="text-sm sm:text-base text-gray-400">
                Manage the face recognition dataset and precomputed embeddings
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
              {/* Dataset Overview */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="lg:col-span-1"
              >
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      Dataset Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="text-center py-4">Loading...</div>
                    ) : datasetInfo ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                          <div className="text-center p-3 bg-gray-800 rounded-lg">
                            <div className="text-xl sm:text-2xl font-bold text-white">
                              {datasetInfo.totalPeople}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-400">
                              Total People
                            </div>
                          </div>
                          <div className="text-center p-3 bg-gray-800 rounded-lg">
                            <div className="text-xl sm:text-2xl font-bold text-green-400">
                              {datasetInfo.totalEmbeddings}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-400">
                              Computed Embeddings
                            </div>
                          </div>
                        </div>

                        <Button
                          onClick={handleRecomputeEmbeddings}
                          disabled={isRecomputing}
                          className="w-full"
                          variant="outline"
                        >
                          <Brain className="h-4 w-4 mr-2" />
                          {isRecomputing
                            ? "Recomputing..."
                            : "Recompute All Embeddings"}
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-400">
                        Failed to load dataset info
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Add Person Form */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserPlus className="h-5 w-5" />
                      Add New Person
                    </CardTitle>
                    <CardDescription>
                      Add a person to the dataset with their face images
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-xs sm:text-sm font-medium">
                        Person Name
                      </label>
                      <input
                        type="text"
                        value={personName}
                        onChange={(e) => setPersonName(e.target.value)}
                        className="w-full mt-1 px-3 py-2 text-sm border border-gray-600 bg-black text-white rounded-md focus:outline-none focus:ring-2 focus:ring-white"
                        placeholder="Enter person's name"
                      />
                    </div>

                    <div>
                      <label className="text-xs sm:text-sm font-medium">
                        Face Images
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileSelect}
                        className="w-full mt-1 text-xs sm:text-sm text-gray-400 file:mr-2 sm:file:mr-4 file:py-1 sm:file:py-2 file:px-2 sm:file:px-4 file:rounded-full file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-white file:text-black hover:file:bg-gray-200"
                      />
                      {selectedFiles.length > 0 && (
                        <p className="text-xs sm:text-sm text-gray-400 mt-1">
                          {selectedFiles.length} file(s) selected
                        </p>
                      )}
                    </div>

                    <Button
                      onClick={handleAddPerson}
                      disabled={
                        isAdding ||
                        !personName.trim() ||
                        selectedFiles.length === 0
                      }
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {isAdding ? "Adding..." : "Add Person"}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* People List */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="lg:col-span-2"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      People in Dataset
                    </CardTitle>
                    <CardDescription>
                      Current people in the face recognition dataset
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="text-center py-8">
                        <RefreshCw className="h-8 w-8 mx-auto mb-4 animate-spin" />
                        <p>Loading dataset...</p>
                      </div>
                    ) : datasetInfo?.dataset &&
                      datasetInfo.dataset.length > 0 ? (
                      <div className="space-y-3">
                        {datasetInfo.dataset.map((person, index) => (
                          <div
                            key={index}
                            className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-800 rounded-lg gap-3 sm:gap-0"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-700 rounded-full flex items-center justify-center text-white font-medium text-sm">
                                {person.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-medium text-sm sm:text-base">
                                  {person.name}
                                </div>
                                <div className="text-xs sm:text-sm text-gray-400 flex items-center gap-2">
                                  <ImageIcon className="h-3 w-3" />
                                  {person.image_count} image(s)
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-11 sm:ml-0">
                              {person.has_embedding ? (
                                <div className="flex items-center gap-1 text-green-400">
                                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                                  <span className="text-xs sm:text-sm">
                                    Embedding Ready
                                  </span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 text-orange-400">
                                  <XCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                                  <span className="text-xs sm:text-sm">
                                    No Embedding
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No people in dataset yet</p>
                        <p className="text-sm">
                          Add some people to get started
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
