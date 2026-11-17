import Swal from "sweetalert2";
import toast from "react-hot-toast";

export const alerts = {
  success(title = "Success!", text = "") {
    return Swal.fire({ icon: "success", title, text, confirmButtonColor: "#4f46e5" });
  },
  error(title = "Something went wrong", text = "") {
    return Swal.fire({ icon: "error", title, text, confirmButtonColor: "#4f46e5" });
  },
  warning(title = "Warning", text = "") {
    return Swal.fire({ icon: "warning", title, text, confirmButtonColor: "#4f46e5" });
  },
  async confirmDelete(item = "this record") {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You are about to delete ${item}. This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
      reverseButtons: true
    });
    return result.isConfirmed;
  },
  async confirmLogout() {
    const result = await Swal.fire({
      title: "Logout?",
      text: "Are you sure you want to log out of SmartDocs AI?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, log out",
      cancelButtonText: "Stay logged in",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
      reverseButtons: true,
      focusCancel: true
    });
    return result.isConfirmed;
  }
};

export const notify = {
  success: (message) => toast.success(message),
  error: (message) => toast.error(message),
  loading: (message) => toast.loading(message),
  dismiss: (id) => toast.dismiss(id)
};