import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AddEducation from "@/components/profile/AddEducation";
import { addEducation, updateEducation } from "@/actions/profile.actions";
import { toast } from "@/components/ui/use-toast";
import { Education } from "@/models/profile.model";

vi.mock("@/actions/profile.actions", () => ({
  addEducation: vi.fn(),
  updateEducation: vi.fn(),
}));

vi.mock("@/components/ui/use-toast", () => ({
  toast: vi.fn(),
}));

vi.mock("@/components/DatePicker", () => ({
  DatePicker: ({ field, isEnabled }: any) => (
    <input
      type="date"
      data-testid={`datepicker-${field.name}`}
      value={
        field.value ? new Date(field.value).toISOString().split("T")[0] : ""
      }
      onChange={(e) => field.onChange(new Date(e.target.value))}
      disabled={!isEnabled}
    />
  ),
}));

vi.mock("@/components/TiptapEditor", () => ({
  __esModule: true,
  default: ({ field }: any) => (
    <textarea
      data-testid="tiptap-editor"
      value={field.value || ""}
      onChange={(e) => field.onChange(e.target.value)}
    />
  ),
}));

const mockEducations: Education[] = [
  {
    institution: "Stanford University",
    degree: "Bachelor's",
    fieldOfStudy: "Computer Science",
    location: "Stanford, CA",
    startDate: "2018-09-01",
    endDate: "2022-06-01",
    description: "Studied computer science",
  },
];

describe("AddEducation Component", () => {
  const user = userEvent.setup();
  const mockResumeId = "resume-123";
  const mockSetDialogOpen = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render Add Education dialog with correct title", async () => {
    render(
      <AddEducation
        resumeId={mockResumeId}
        educationIndex={undefined}
        educations={undefined}
        dialogOpen={true}
        setDialogOpen={mockSetDialogOpen}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Add Education")).toBeInTheDocument();
    });
  });

  it("should render Edit Education dialog when educationId is provided", async () => {
    render(
      <AddEducation
        resumeId={mockResumeId}
        educationIndex={0}
        educations={mockEducations}
        dialogOpen={true}
        setDialogOpen={mockSetDialogOpen}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Edit Education")).toBeInTheDocument();
    });
  });

  it("should render all form fields correctly", async () => {
    render(
      <AddEducation
        resumeId={mockResumeId}
        educationIndex={undefined}
        educations={undefined}
        dialogOpen={true}
        setDialogOpen={mockSetDialogOpen}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("School")).toBeInTheDocument();
      expect(screen.getByText("Location")).toBeInTheDocument();
      expect(screen.getByText("Degree")).toBeInTheDocument();
      expect(screen.getByText("Field of study")).toBeInTheDocument();
      expect(screen.getByText("Start Date")).toBeInTheDocument();
      expect(screen.getByText("End Date")).toBeInTheDocument();
      expect(screen.getByText(/degree completed/i)).toBeInTheDocument();
      expect(screen.getByText("Description")).toBeInTheDocument();
    });
  });

  it("should populate form fields when editing an education", async () => {
    render(
      <AddEducation
        resumeId={mockResumeId}
        educationIndex={0}
        educations={mockEducations}
        dialogOpen={true}
        setDialogOpen={mockSetDialogOpen}
      />
    );

    await waitFor(() => {
      const institutionInput = screen.getByPlaceholderText(
        "Ex: Stanford"
      ) as HTMLInputElement;
      expect(institutionInput.value).toBe("Stanford University");

      const degreeInput = screen.getByPlaceholderText(
        "Ex: Bachelor's"
      ) as HTMLInputElement;
      expect(degreeInput.value).toBe("Bachelor's");

      const fieldOfStudyInput = screen.getByPlaceholderText(
        "Ex: Computer Science"
      ) as HTMLInputElement;
      expect(fieldOfStudyInput.value).toBe("Computer Science");
    });
  });

  it("should close dialog when Cancel button is clicked", async () => {
    render(
      <AddEducation
        resumeId={mockResumeId}
        educationIndex={undefined}
        educations={undefined}
        dialogOpen={true}
        setDialogOpen={mockSetDialogOpen}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Add Education")).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    await user.click(cancelButton);

    expect(mockSetDialogOpen).toHaveBeenCalledWith(false);
  });

  it("should toggle degree completed label text", async () => {
    render(
      <AddEducation
        resumeId={mockResumeId}
        educationIndex={undefined}
        educations={undefined}
        dialogOpen={true}
        setDialogOpen={mockSetDialogOpen}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/degree completed/i)).toBeInTheDocument();
    });

    const degreeCompletedSwitch = screen.getByRole("switch");
    await user.click(degreeCompletedSwitch);

    await waitFor(() => {
      expect(screen.getByText(/currently studying/i)).toBeInTheDocument();
    });
  });

  it("should call addEducation when submitting a new education", async () => {
    (addEducation as any).mockResolvedValue({
      success: true,
      message: "Education added successfully",
    });

    render(
      <AddEducation
        resumeId={mockResumeId}
        educationIndex={undefined}
        educations={undefined}
        dialogOpen={true}
        setDialogOpen={mockSetDialogOpen}
      />
    );

    const institutionInput = screen.getByPlaceholderText("Ex: Stanford") as HTMLInputElement;
    const locationInput = screen.getByPlaceholderText("e.g. Toronto, ON") as HTMLInputElement;
    const degreeInput = screen.getByPlaceholderText("Ex: Bachelor's") as HTMLInputElement;
    const fieldOfStudyInput = screen.getByPlaceholderText("Ex: Computer Science") as HTMLInputElement;
    const startDateInput = screen.getByTestId("datepicker-startDate") as HTMLInputElement;

    await user.type(institutionInput, "MIT");
    await user.type(locationInput, "Cambridge, MA");
    await user.type(degreeInput, "Master's");
    await user.type(fieldOfStudyInput, "Artificial Intelligence");
    await user.type(startDateInput, "2020-09-01");

    await waitFor(() => {
      const saveButton = screen.getByRole("button", { name: /save/i });
      expect(saveButton).not.toBeDisabled();
    });

    const saveButton = screen.getByRole("button", { name: /save/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(addEducation).toHaveBeenCalledTimes(1);
      expect(addEducation).toHaveBeenCalledWith(
        expect.objectContaining({
          institution: "MIT",
          degree: "Master's",
          fieldOfStudy: "Artificial Intelligence",
        })
      );
    });
  });

  it("should call updateEducation when editing an existing education", async () => {
    (updateEducation as any).mockResolvedValue({
      success: true,
      message: "Education updated successfully",
    });

    render(
      <AddEducation
        resumeId={mockResumeId}
        educationIndex={0}
        educations={mockEducations}
        dialogOpen={true}
        setDialogOpen={mockSetDialogOpen}
      />
    );

    await waitFor(() => {
      const institutionInput = screen.getByPlaceholderText(
        "Ex: Stanford"
      ) as HTMLInputElement;
      expect(institutionInput.value).toBe("Stanford University");
    });

    const degreeInput = screen.getByPlaceholderText("Ex: Bachelor's") as HTMLInputElement;
    await user.clear(degreeInput);
    await user.type(degreeInput, "Master's");

    await waitFor(() => {
      const saveButton = screen.getByRole("button", { name: /save/i });
      expect(saveButton).not.toBeDisabled();
    });

    const saveButton = screen.getByRole("button", { name: /save/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(updateEducation).toHaveBeenCalledTimes(1);
      expect(updateEducation).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "edu-1",
          degree: "Master's",
        })
      );
    });
  });

  it("should close dialog and show success toast on successful submission", async () => {
    (addEducation as any).mockResolvedValue({
      success: true,
      message: "Education added successfully",
    });

    render(
      <AddEducation
        resumeId={mockResumeId}
        educationIndex={undefined}
        educations={undefined}
        dialogOpen={true}
        setDialogOpen={mockSetDialogOpen}
      />
    );

    const institutionInput = screen.getByPlaceholderText("Ex: Stanford") as HTMLInputElement;
    const locationInput = screen.getByPlaceholderText("e.g. Toronto, ON") as HTMLInputElement;
    const degreeInput = screen.getByPlaceholderText("Ex: Bachelor's") as HTMLInputElement;
    const fieldOfStudyInput = screen.getByPlaceholderText("Ex: Computer Science") as HTMLInputElement;
    const startDateInput = screen.getByTestId("datepicker-startDate") as HTMLInputElement;

    await user.type(institutionInput, "Harvard");
    await user.type(locationInput, "Cambridge, MA");
    await user.type(degreeInput, "PhD");
    await user.type(fieldOfStudyInput, "Mathematics");
    await user.type(startDateInput, "2019-09-01");

    await waitFor(() => {
      const saveButton = screen.getByRole("button", { name: /save/i });
      expect(saveButton).not.toBeDisabled();
    });

    const saveButton = screen.getByRole("button", { name: /save/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockSetDialogOpen).toHaveBeenCalledWith(false);
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: "success",
          description: expect.stringContaining("added"),
        })
      );
    });
  });

  it("should show error toast on failed submission", async () => {
    (addEducation as any).mockResolvedValue({
      success: false,
      message: "Failed to add education",
    });

    render(
      <AddEducation
        resumeId={mockResumeId}
        educationIndex={undefined}
        educations={undefined}
        dialogOpen={true}
        setDialogOpen={mockSetDialogOpen}
      />
    );

    const institutionInput = screen.getByPlaceholderText("Ex: Stanford") as HTMLInputElement;
    const locationInput = screen.getByPlaceholderText("e.g. Toronto, ON") as HTMLInputElement;
    const degreeInput = screen.getByPlaceholderText("Ex: Bachelor's") as HTMLInputElement;
    const fieldOfStudyInput = screen.getByPlaceholderText("Ex: Computer Science") as HTMLInputElement;
    const startDateInput = screen.getByTestId("datepicker-startDate") as HTMLInputElement;

    await user.type(institutionInput, "Yale");
    await user.type(locationInput, "New Haven, CT");
    await user.type(degreeInput, "Bachelor's");
    await user.type(fieldOfStudyInput, "Physics");
    await user.type(startDateInput, "2021-09-01");

    await waitFor(() => {
      const saveButton = screen.getByRole("button", { name: /save/i });
      expect(saveButton).not.toBeDisabled();
    });

    const saveButton = screen.getByRole("button", { name: /save/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: "destructive",
          title: "Error!",
          description: "Failed to add education",
        })
      );
      expect(mockSetDialogOpen).not.toHaveBeenCalledWith(false);
    });
  });

  it("should not render dialog when dialogOpen is false", () => {
    const { container } = render(
      <AddEducation
        resumeId={mockResumeId}
        educationIndex={undefined}
        educations={undefined}
        dialogOpen={false}
        setDialogOpen={mockSetDialogOpen}
      />
    );

    expect(screen.queryByText("Add Education")).not.toBeInTheDocument();
    expect(container.querySelector("form")).not.toBeInTheDocument();
  });
});
