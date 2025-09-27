import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MediaUploadStep } from "../media-upload-step";

// Mock the image upload service
jest.mock("@/lib/services/image-upload-service", () => ({
  generateSignedUrl: jest.fn(),
  uploadDirect: jest.fn(),
  processMetadata: jest.fn(),
}));

import {
  generateSignedUrl,
  uploadDirect,
  processMetadata,
} from "@/lib/services/image-upload-service";

const mockGenerateSignedUrl = generateSignedUrl as jest.MockedFunction<
  typeof generateSignedUrl
>;
const mockUploadDirect = uploadDirect as jest.MockedFunction<
  typeof uploadDirect
>;
const mockProcessMetadata = processMetadata as jest.MockedFunction<
  typeof processMetadata
>;

// Mock drag and drop functionality
const mockDataTransfer = {
  files: [],
  items: [],
  types: [],
  getData: jest.fn(),
  setData: jest.fn(),
  clearData: jest.fn(),
  setDragImage: jest.fn(),
};

describe("MediaUploadStep", () => {
  const mockProps = {
    data: { images: [] },
    onUpdate: jest.fn(),
    onNext: jest.fn(),
    onPrevious: jest.fn(),
    locale: "es" as const,
  };

  const mockImageFile = new File(["image content"], "test-image.jpg", {
    type: "image/jpeg",
    size: 1024 * 1024, // 1MB
  });

  const mockSignedUrlResponse = {
    uploadUrl: "https://blob.vercel-storage.com/upload-url",
    publicUrl: "https://blob.vercel-storage.com/test-image.jpg",
    expiresAt: new Date(Date.now() + 3600000),
  };

  const mockUploadResult = {
    url: "https://blob.vercel-storage.com/test-image.jpg",
    size: 1024 * 1024,
    uploadedAt: new Date(),
  };

  const mockImageMetadata = {
    id: "img-1",
    url: "https://blob.vercel-storage.com/test-image.jpg",
    filename: "test-image.jpg",
    size: 1024 * 1024,
    contentType: "image/jpeg",
    width: 800,
    height: 600,
  };

  beforeEach(() => {
    mockGenerateSignedUrl.mockResolvedValue(mockSignedUrlResponse);
    mockUploadDirect.mockResolvedValue(mockUploadResult);
    mockProcessMetadata.mockReturnValue(mockImageMetadata);

    // Mock URL.createObjectURL
    global.URL.createObjectURL = jest.fn(() => "blob:mock-url");
    global.URL.revokeObjectURL = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders upload interface", () => {
    render(<MediaUploadStep {...mockProps} />);

    expect(
      screen.getByText("Arrastra imágenes aquí o haz clic para seleccionar")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Formatos soportados: JPG, PNG, WebP")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Tamaño máximo: 10MB por imagen")
    ).toBeInTheDocument();
  });

  it("handles file selection via input", async () => {
    const user = userEvent.setup();

    render(<MediaUploadStep {...mockProps} />);

    const fileInput = screen.getByLabelText("Seleccionar imágenes");
    await user.upload(fileInput, mockImageFile);

    await waitFor(() => {
      expect(mockGenerateSignedUrl).toHaveBeenCalledWith(
        "test-image.jpg",
        "image/jpeg"
      );
    });

    await waitFor(() => {
      expect(mockUploadDirect).toHaveBeenCalledWith(
        mockImageFile,
        mockSignedUrlResponse.uploadUrl
      );
    });

    await waitFor(() => {
      expect(mockProps.onUpdate).toHaveBeenCalledWith({
        images: [mockImageMetadata],
      });
    });
  });

  it("handles drag and drop upload", async () => {
    render(<MediaUploadStep {...mockProps} />);

    const dropZone = screen.getByTestId("upload-dropzone");

    // Simulate drag enter
    fireEvent.dragEnter(dropZone, {
      dataTransfer: { ...mockDataTransfer, files: [mockImageFile] },
    });

    expect(dropZone).toHaveClass("drag-over");

    // Simulate drop
    fireEvent.drop(dropZone, {
      dataTransfer: { ...mockDataTransfer, files: [mockImageFile] },
    });

    await waitFor(() => {
      expect(mockGenerateSignedUrl).toHaveBeenCalledWith(
        "test-image.jpg",
        "image/jpeg"
      );
    });
  });

  it("validates file types", async () => {
    const user = userEvent.setup();
    const invalidFile = new File(["content"], "test.txt", {
      type: "text/plain",
    });

    render(<MediaUploadStep {...mockProps} />);

    const fileInput = screen.getByLabelText("Seleccionar imágenes");
    await user.upload(fileInput, invalidFile);

    expect(
      screen.getByText("Tipo de archivo no soportado: test.txt")
    ).toBeInTheDocument();
    expect(mockGenerateSignedUrl).not.toHaveBeenCalled();
  });

  it("validates file sizes", async () => {
    const user = userEvent.setup();
    const largeFile = new File(["x".repeat(11 * 1024 * 1024)], "large.jpg", {
      type: "image/jpeg",
      size: 11 * 1024 * 1024, // 11MB
    });

    render(<MediaUploadStep {...mockProps} />);

    const fileInput = screen.getByLabelText("Seleccionar imágenes");
    await user.upload(fileInput, largeFile);

    expect(
      screen.getByText("Archivo muy grande: large.jpg (máximo 10MB)")
    ).toBeInTheDocument();
    expect(mockGenerateSignedUrl).not.toHaveBeenCalled();
  });

  it("displays upload progress", async () => {
    const user = userEvent.setup();

    // Make upload take time
    mockUploadDirect.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve(mockUploadResult), 1000)
        )
    );

    render(<MediaUploadStep {...mockProps} />);

    const fileInput = screen.getByLabelText("Seleccionar imágenes");
    await user.upload(fileInput, mockImageFile);

    expect(screen.getByText("Subiendo test-image.jpg...")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("handles upload errors", async () => {
    const user = userEvent.setup();
    mockUploadDirect.mockRejectedValue(new Error("Upload failed"));

    render(<MediaUploadStep {...mockProps} />);

    const fileInput = screen.getByLabelText("Seleccionar imágenes");
    await user.upload(fileInput, mockImageFile);

    await waitFor(() => {
      expect(
        screen.getByText("Error al subir test-image.jpg: Upload failed")
      ).toBeInTheDocument();
    });
  });

  it("displays uploaded images with previews", () => {
    const dataWithImages = {
      images: [mockImageMetadata],
    };

    render(<MediaUploadStep {...mockProps} data={dataWithImages} />);

    expect(screen.getByAltText("test-image.jpg")).toBeInTheDocument();
    expect(screen.getByText("test-image.jpg")).toBeInTheDocument();
    expect(screen.getByText("1.0 MB")).toBeInTheDocument();
  });

  it("allows image reordering", async () => {
    const user = userEvent.setup();
    const dataWithMultipleImages = {
      images: [
        { ...mockImageMetadata, id: "img-1", filename: "image1.jpg" },
        { ...mockImageMetadata, id: "img-2", filename: "image2.jpg" },
      ],
    };

    render(<MediaUploadStep {...mockProps} data={dataWithMultipleImages} />);

    const moveUpButton = screen.getAllByLabelText("Mover hacia arriba")[1];
    await user.click(moveUpButton);

    expect(mockProps.onUpdate).toHaveBeenCalledWith({
      images: [
        { ...mockImageMetadata, id: "img-2", filename: "image2.jpg" },
        { ...mockImageMetadata, id: "img-1", filename: "image1.jpg" },
      ],
    });
  });

  it("allows image deletion", async () => {
    const user = userEvent.setup();
    const dataWithImages = {
      images: [mockImageMetadata],
    };

    render(<MediaUploadStep {...mockProps} data={dataWithImages} />);

    const deleteButton = screen.getByLabelText("Eliminar imagen");
    await user.click(deleteButton);

    expect(mockProps.onUpdate).toHaveBeenCalledWith({
      images: [],
    });
  });

  it("validates minimum image requirement", async () => {
    const user = userEvent.setup();

    render(<MediaUploadStep {...mockProps} />);

    const nextButton = screen.getByText("Siguiente");
    await user.click(nextButton);

    expect(
      screen.getByText("Debe subir al menos una imagen")
    ).toBeInTheDocument();
  });

  it("validates maximum image limit", async () => {
    const user = userEvent.setup();
    const dataWithMaxImages = {
      images: Array.from({ length: 20 }, (_, i) => ({
        ...mockImageMetadata,
        id: `img-${i}`,
        filename: `image${i}.jpg`,
      })),
    };

    render(<MediaUploadStep {...mockProps} data={dataWithMaxImages} />);

    const fileInput = screen.getByLabelText("Seleccionar imágenes");
    await user.upload(fileInput, mockImageFile);

    expect(
      screen.getByText("Máximo 20 imágenes permitidas")
    ).toBeInTheDocument();
    expect(mockGenerateSignedUrl).not.toHaveBeenCalled();
  });

  it("supports batch upload", async () => {
    const user = userEvent.setup();
    const files = [
      new File(["content1"], "image1.jpg", { type: "image/jpeg" }),
      new File(["content2"], "image2.jpg", { type: "image/jpeg" }),
    ];

    render(<MediaUploadStep {...mockProps} />);

    const fileInput = screen.getByLabelText("Seleccionar imágenes");
    await user.upload(fileInput, files);

    expect(mockGenerateSignedUrl).toHaveBeenCalledTimes(2);
    expect(mockUploadDirect).toHaveBeenCalledTimes(2);
  });

  it("handles partial batch upload failures", async () => {
    const user = userEvent.setup();
    const files = [
      new File(["content1"], "image1.jpg", { type: "image/jpeg" }),
      new File(["content2"], "image2.jpg", { type: "image/jpeg" }),
    ];

    // Make second upload fail
    mockUploadDirect
      .mockResolvedValueOnce(mockUploadResult)
      .mockRejectedValueOnce(new Error("Upload failed"));

    render(<MediaUploadStep {...mockProps} />);

    const fileInput = screen.getByLabelText("Seleccionar imágenes");
    await user.upload(fileInput, files);

    await waitFor(() => {
      expect(
        screen.getByText("1 de 2 imágenes subidas correctamente")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Error al subir image2.jpg: Upload failed")
      ).toBeInTheDocument();
    });
  });

  it("shows retry option for failed uploads", async () => {
    const user = userEvent.setup();
    mockUploadDirect.mockRejectedValueOnce(new Error("Network error"));

    render(<MediaUploadStep {...mockProps} />);

    const fileInput = screen.getByLabelText("Seleccionar imágenes");
    await user.upload(fileInput, mockImageFile);

    await waitFor(() => {
      expect(screen.getByText("Reintentar")).toBeInTheDocument();
    });

    // Reset mock to succeed on retry
    mockUploadDirect.mockResolvedValueOnce(mockUploadResult);

    const retryButton = screen.getByText("Reintentar");
    await user.click(retryButton);

    await waitFor(() => {
      expect(mockUploadDirect).toHaveBeenCalledTimes(2);
    });
  });

  it("navigates to previous step", async () => {
    const user = userEvent.setup();

    render(<MediaUploadStep {...mockProps} />);

    const prevButton = screen.getByText("Anterior");
    await user.click(prevButton);

    expect(mockProps.onPrevious).toHaveBeenCalled();
  });

  it("proceeds to next step when valid", async () => {
    const user = userEvent.setup();
    const dataWithImages = {
      images: [mockImageMetadata],
    };

    render(<MediaUploadStep {...mockProps} data={dataWithImages} />);

    const nextButton = screen.getByText("Siguiente");
    await user.click(nextButton);

    expect(mockProps.onNext).toHaveBeenCalled();
  });
});
