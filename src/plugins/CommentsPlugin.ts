import type { SimplePlugin, PluginContext } from './types';
import type CommentManager from '../managers/CommentManager';
import type { PageComment } from '../types/Comment';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

const CommentsPlugin: SimplePlugin = {
  name: 'CommentsPlugin',
  description: 'Displays page comments and a submission form for authenticated users',
  author: 'ngdpbase',
  version: '1.0.0',

  async execute(context: PluginContext): Promise<string> {
    const engine = context.engine;
    if (!engine) return '';

    const commentManager = engine.getManager('CommentManager') as CommentManager | undefined;
    if (!commentManager || !commentManager.isEnabled()) return '';

    const pageMetadata = context.pageMetadata as { uuid?: string } | undefined;
    const pageUuid = pageMetadata?.uuid;
    if (!pageUuid) return '';

    const userContext = context.userContext as {
      isAuthenticated?: boolean;
      username?: string;
      displayName?: string;
      name?: string;
      roles?: string[];
    } | undefined;

    const isAuthenticated = userContext?.isAuthenticated === true;
    const username = userContext?.username ?? '';
    const displayName = userContext?.displayName ?? userContext?.name ?? username;
    const isAdmin = (userContext?.roles ?? []).includes('admin');

    const comments: PageComment[] = await commentManager.getComments(pageUuid);

    const parts: string[] = ['<section class="page-comments">'];

    if (comments.length === 0) {
      parts.push('<p class="no-comments"><em>No comments yet.</em></p>');
    } else {
      parts.push('<div class="comment-list">');
      for (const c of comments) {
        const canDelete = isAdmin || (isAuthenticated && c.author === username);
        parts.push(`<div class="comment" id="comment-${escapeHtml(c.id)}">`);
        parts.push('  <div class="comment-meta">');
        parts.push(`    <span class="comment-author">${escapeHtml(c.authorDisplayName)}</span>`);
        parts.push(`    <span class="comment-date">${formatDate(c.createdAt)}</span>`);
        if (canDelete) {
          parts.push(`    <button class="comment-delete-btn btn btn-sm btn-outline-danger ms-2" onclick="ngdpDeleteComment('${escapeHtml(pageUuid)}','${escapeHtml(c.id)}')">Delete</button>`);
        }
        parts.push('  </div>');
        parts.push(`  <div class="comment-body">${escapeHtml(c.content).replace(/\n/g, '<br>')}</div>`);
        parts.push('</div>');
      }
      parts.push('</div>');
    }

    if (isAuthenticated) {
      parts.push(`<form class="comment-form mt-3" onsubmit="ngdpSubmitComment(event,'${escapeHtml(pageUuid)}')">`);
      parts.push('  <div class="mb-2">');
      parts.push(`    <label class="form-label">Add a comment (as <strong>${escapeHtml(displayName)}</strong>)</label>`);
      parts.push('    <textarea class="form-control comment-input" name="content" rows="3" maxlength="2000" required placeholder="Write your comment…"></textarea>');
      parts.push('  </div>');
      parts.push('  <button type="submit" class="btn btn-sm btn-primary">Post Comment</button>');
      parts.push('</form>');
      parts.push(`<script>
function ngdpSubmitComment(e, pageUuid) {
  e.preventDefault();
  const content = e.target.querySelector('.comment-input').value.trim();
  if (!content) return;
  fetch('/api/comments/' + pageUuid, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content })
  }).then(r => r.json()).then(data => {
    if (data.success) { location.reload(); }
    else { alert(data.error || 'Failed to post comment.'); }
  }).catch(() => alert('Failed to post comment.'));
}
function ngdpDeleteComment(pageUuid, commentId) {
  if (!confirm('Delete this comment?')) return;
  fetch('/api/comments/' + pageUuid + '/' + commentId, {
    method: 'DELETE'
  }).then(r => r.json()).then(data => {
    if (data.success) { location.reload(); }
    else { alert(data.error || 'Failed to delete comment.'); }
  }).catch(() => alert('Failed to delete comment.'));
}
</script>`);
    } else {
      parts.push('<p class="comment-login-prompt mt-2"><em>You must be logged in to post a comment.</em></p>');
    }

    parts.push('</section>');
    return parts.join('\n');
  }
};

export default CommentsPlugin;
