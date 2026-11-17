<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DocumentController extends Controller
{
    private function visibleDocuments(Request $request)
    {
        $query = Document::with(['user:id,name', 'category:id,name'])->latest();

        // Staff can only access their own documents.
        if ($request->user()->hasRole('Staff')) {
            $query->where('user_id', $request->user()->id);
        }

        return $query;
    }

    public function index(Request $request)
    {
        $query = $this->visibleDocuments($request);

        if ($request->filled('search')) {
            $search = $request->string('search')->toString();

            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('original_name', 'like', "%{$search}%");
            });
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->integer('category_id'));
        }

        return response()->json([
            'documents' => $query->paginate(10),
            'categories' => Category::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'category_id' => ['nullable', 'exists:categories,id'],
            'file' => ['required', 'file', 'max:20480', 'mimes:pdf,doc,docx,txt,xls,xlsx,csv,png,jpg,jpeg'],
        ]);

        $uploadedFile = $request->file('file');
        $path = $uploadedFile->store('documents', 'local');

        $document = Document::create([
            'user_id' => $request->user()->id,
            'category_id' => $data['category_id'] ?? null,
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'original_name' => $uploadedFile->getClientOriginalName(),
            'file_path' => $path,
            'mime_type' => $uploadedFile->getMimeType(),
            'file_size' => $uploadedFile->getSize(),
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Document uploaded successfully.',
            'document' => $document,
        ], 201);
    }

    public function show(Request $request, Document $document)
    {
        $this->authorizeDocument($request, $document);

        return response()->json([
            'document' => $document->load(['user:id,name', 'category:id,name']),
        ]);
    }

    public function update(Request $request, Document $document)
    {
        $this->authorizeDocument($request, $document);

        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'category_id' => ['nullable', 'exists:categories,id'],
            'file' => ['sometimes', 'required', 'file', 'max:20480', 'mimes:pdf,doc,docx,txt,xls,xlsx,csv,png,jpg,jpeg'],
        ]);

        $document->fill([
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'category_id' => $data['category_id'] ?? null,
        ]);

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $newPath = $file->store('documents', 'local');

            if (!$newPath) {
                return response()->json([
                    'message' => 'Unable to save the uploaded file.',
                ], 500);
            }

            Storage::disk('local')->delete($document->file_path);

            $document->file_path = $newPath;
            $document->original_name = $file->getClientOriginalName();
            $document->mime_type = $file->getMimeType();
            $document->file_size = $file->getSize();
        }

        $document->save();

        return response()->json([
            'message' => 'Document updated successfully.',
            'document' => $document->load(['user:id,name', 'category:id,name']),
        ]);
    }

    public function preview(Request $request, Document $document)
    {
        $this->authorizeDocument($request, $document);

        $path = $document->file_path;

        abort_unless(Storage::disk('local')->exists($path), 404);

        $allowed = [
            'application/pdf',
            'image/jpeg',
            'image/png',
            'text/plain',
        ];

        abort_unless(
            in_array($document->mime_type, $allowed, true),
            415,
            'Preview is not supported for this file type.'
        );

        return Storage::disk('local')->response(
            $path,
            $document->original_name,
            [
                'Content-Type' => $document->mime_type,
                'X-Content-Type-Options' => 'nosniff',
            ],
            'inline'
        );
    }

    public function download(Request $request, Document $document)
    {
        $this->authorizeDocument($request, $document);

        abort_unless(
            Storage::disk('local')->exists($document->file_path),
            404
        );

        return Storage::disk('local')->download(
            $document->file_path,
            $document->original_name
        );
    }

    public function destroy(Request $request, Document $document)
    {
        $this->authorizeDocument($request, $document);

        Storage::disk('local')->delete($document->file_path);
        $document->delete();

        return response()->json([
            'message' => 'Document deleted successfully.',
        ]);
    }

    private function authorizeDocument(Request $request, Document $document): void
    {
        $user = $request->user();

        if ($user->hasRole('Staff') && $document->user_id !== $user->id) {
            abort(403, 'You cannot access this document.');
        }

        if (!$user->can('documents.view')) {
            abort(403, 'You do not have permission to view documents.');
        }
    }
}
